<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\CheckoutRequest;
use App\Models\Order;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\StripeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly CheckoutService $checkoutService,
        private readonly StripeService $stripeService,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->cartService->resolve($request);

        if ($cart->items()->count() === 0) {
            return redirect()->route('cart.index')
                ->with('error', 'O carrinho está vazio.');
        }

        $user = $request->user();
        $billingAddress = $user?->billingAddresses()->where('is_default', true)->first()
            ?? $user?->billingAddresses()->first();
        $shippingAddress = $user?->shippingAddresses()->where('is_default', true)->first()
            ?? $user?->shippingAddresses()->first();

        return Inertia::render('Store/Checkout/Index', [
            'cart' => $this->cartService->summary($cart),
            'stripeKey' => $this->stripeService->publishableKey(),
            'defaults' => [
                'billing_name' => $billingAddress?->name ?? $user?->name ?? '',
                'billing_tax_id' => $billingAddress?->tax_id ?? $user?->tax_id ?? '',
                'billing_email' => $user?->email ?? '',
                'billing_phone' => $billingAddress?->phone ?? $user?->phone ?? '',
                'billing_address_line_1' => $billingAddress?->address_line_1 ?? '',
                'billing_address_line_2' => $billingAddress?->address_line_2 ?? '',
                'billing_city' => $billingAddress?->city ?? '',
                'billing_state' => $billingAddress?->state ?? '',
                'billing_postal_code' => $billingAddress?->postal_code ?? '',
                'billing_country' => $billingAddress?->country ?? 'PT',
                'shipping_name' => $shippingAddress?->name ?? $user?->name ?? '',
                'shipping_phone' => $shippingAddress?->phone ?? $user?->phone ?? '',
                'shipping_address_line_1' => $shippingAddress?->address_line_1 ?? '',
                'shipping_address_line_2' => $shippingAddress?->address_line_2 ?? '',
                'shipping_city' => $shippingAddress?->city ?? '',
                'shipping_state' => $shippingAddress?->state ?? '',
                'shipping_postal_code' => $shippingAddress?->postal_code ?? '',
                'shipping_country' => $shippingAddress?->country ?? 'PT',
                'same_as_billing' => ! $shippingAddress,
            ],
        ]);
    }

    public function store(CheckoutRequest $request): Response
    {
        $result = $this->checkoutService->createOrder($request, $request->validated());

        return $this->paymentPage($result['order'], $result['client_secret']);
    }

    public function payment(Request $request, Order $order): Response|RedirectResponse
    {
        $this->authorizeOrderAccess($request, $order);

        if ($order->isPaid()) {
            $params = ['order' => $order->id];

            if ($order->guest_token && $request->query('token') === $order->guest_token) {
                $params['token'] = $order->guest_token;
            }

            return redirect()->route('checkout.success', $params);
        }

        if (! $order->stripe_checkout_session_id) {
            abort(404, 'Pagamento não encontrado para esta encomenda.');
        }

        try {
            $session = $this->stripeService->retrieveOrderCheckoutSession($order);
        } catch (\Throwable) {
            abort(503, 'Não foi possível carregar o pagamento. Verifique a configuração do Stripe.');
        }

        return $this->paymentPage($order, $session->client_secret);
    }

    public function success(Request $request, Order $order): Response
    {
        $this->authorizeOrderAccess($request, $order);

        $paymentState = $this->syncPaymentState(
            $order,
            $request->string('session_id')->toString() ?: null,
        );

        if ($order->isPaid()) {
            $cart = $this->cartService->resolve($request);
            $this->cartService->clear($cart);
            $this->checkoutService->clearCheckoutSession($request);
        }

        return Inertia::render('Store/Checkout/Success', [
            'order' => [
                'order_number' => $order->order_number,
                'total' => (float) $order->total,
                'currency' => $order->currency,
                'email' => $order->billing_email,
            ],
            'paymentState' => $paymentState,
            'paymentUrl' => $paymentState === 'pending'
                ? $this->checkoutService->customerPaymentUrl($order)
                : null,
        ]);
    }

    private function syncPaymentState(Order $order, ?string $sessionId = null): string
    {
        if ($order->isPaid()) {
            return 'paid';
        }

        $sessionId = $sessionId ?: $order->stripe_checkout_session_id;

        if (! $sessionId) {
            return 'pending';
        }

        try {
            $session = $this->stripeService->retrieveCheckoutSession($sessionId, true);
        } catch (\Throwable) {
            return 'pending';
        }

        if ($session->payment_status === 'paid') {
            $this->checkoutService->markAsPaid(
                $order,
                $this->resolveChargeId($session),
                $this->resolvePaymentIntentId($session),
                $session->id,
            );
            $order->refresh();

            return 'paid';
        }

        $paymentIntent = $session->payment_intent;

        if ($paymentIntent instanceof PaymentIntent) {
            if ($paymentIntent->status === 'requires_payment_method') {
                return 'failed';
            }

            if (in_array($paymentIntent->status, ['processing', 'requires_action'], true)) {
                return 'pending';
            }
        }

        if ($session->status === 'complete') {
            return 'pending';
        }

        return 'pending';
    }

    private function resolvePaymentIntentId(Session $session): ?string
    {
        $paymentIntent = $session->payment_intent;

        if ($paymentIntent instanceof PaymentIntent) {
            return $paymentIntent->id;
        }

        return is_string($paymentIntent) ? $paymentIntent : null;
    }

    private function resolveChargeId(Session $session): ?string
    {
        $paymentIntent = $session->payment_intent;

        if (! $paymentIntent instanceof PaymentIntent) {
            return null;
        }

        $chargeId = $paymentIntent->latest_charge;

        return is_string($chargeId) ? $chargeId : null;
    }

    private function authorizeOrderAccess(Request $request, Order $order): void
    {
        if ($request->user() && $order->user_id === $request->user()->id) {
            return;
        }

        if ($order->guest_token && $request->query('token') === $order->guest_token) {
            return;
        }

        if ($request->session()->get('checkout_order_id') === $order->id) {
            return;
        }

        abort(403);
    }

    private function paymentPage(Order $order, string $clientSecret): Response
    {
        return Inertia::render('Store/Checkout/Payment', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total' => (float) $order->total,
                'currency' => $order->currency,
                'guest_token' => $order->guest_token,
            ],
            'clientSecret' => $clientSecret,
            'stripeKey' => $this->stripeService->publishableKey(),
            'paymentMethodOrder' => $this->stripeService->paymentMethodTypes(),
        ]);
    }
}
