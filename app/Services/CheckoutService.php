<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Support\VatCalculator;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly SettingsService $settings,
        private readonly StripeService $stripe,
        private readonly OrderAddressService $orderAddresses,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array{order: Order, client_secret: string}
     */
    public function createOrder(Request $request, array $data): array
    {
        $cart = $this->cartService->resolve($request);
        $cart->load(['items.product', 'items.variant']);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => 'O carrinho está vazio.',
            ]);
        }

        $idempotencyKey = $this->resolveIdempotencyKey($request);

        $existing = Order::query()
            ->where('idempotency_key', $idempotencyKey)
            ->where('payment_status', PaymentStatus::Pending)
            ->first();

        if ($existing?->stripe_checkout_session_id) {
            try {
                $session = $this->stripe->retrieveCheckoutSession(
                    $existing->stripe_checkout_session_id,
                );

                if ($session->status !== 'expired' && filled($session->client_secret)) {
                    return [
                        'order' => $existing->load('items'),
                        'client_secret' => $session->client_secret,
                    ];
                }
            } catch (\Throwable) {
                // Sessão inválida — recriamos abaixo com a mesma encomenda pendente.
            }
        }

        $totals = $this->cartService->summary($cart);
        $promotion = $this->resolvePromotion($data['promotion_code'] ?? null, $cart, $totals['subtotal']);
        $discount = $promotion ? $this->calculateDiscount($promotion, $totals['subtotal']) : 0;
        $subtotalAfterDiscount = max(0, $totals['subtotal'] - $discount);
        $taxTotal = VatCalculator::taxFromNet($subtotalAfterDiscount, $totals['vat_rate']);
        $total = round($subtotalAfterDiscount + $taxTotal + $totals['shipping'], 2);

        return DB::transaction(function () use (
            $request,
            $data,
            $cart,
            $totals,
            $promotion,
            $discount,
            $taxTotal,
            $total,
            $idempotencyKey,
            $existing,
        ) {
            $order = $existing
                ? $this->updatePendingOrder(
                    $existing,
                    $request,
                    $data,
                    $cart,
                    $totals,
                    $promotion,
                    $discount,
                    $taxTotal,
                    $total,
                )
                : $this->createPendingOrder(
                    $request,
                    $data,
                    $cart,
                    $totals,
                    $promotion,
                    $discount,
                    $taxTotal,
                    $total,
                    $idempotencyKey,
                );

            $session = $this->stripe->createCheckoutSession($order);
            $order->update(['stripe_checkout_session_id' => $session->id]);

            $request->session()->put('checkout_idempotency_key', $idempotencyKey);
            $request->session()->put('checkout_order_id', $order->id);

            $clientSecret = $session->client_secret;

            if (! filled($clientSecret)) {
                throw new \RuntimeException('O Stripe não devolveu credenciais de pagamento.');
            }

            return [
                'order' => $order->load('items'),
                'client_secret' => $clientSecret,
            ];
        });
    }

    private function resolveIdempotencyKey(Request $request): string
    {
        $key = $request->session()->get('checkout_idempotency_key');

        if (! $key) {
            return (string) Str::uuid();
        }

        $order = Order::query()
            ->where('idempotency_key', $key)
            ->first();

        if ($order && $order->payment_status !== PaymentStatus::Pending) {
            $key = (string) Str::uuid();
            $request->session()->put('checkout_idempotency_key', $key);
        }

        return (string) $key;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function createPendingOrder(
        Request $request,
        array $data,
        Cart $cart,
        array $totals,
        ?Promotion $promotion,
        float $discount,
        float $taxTotal,
        float $total,
        string $idempotencyKey,
    ): Order {
        $order = Order::query()->create([
            'order_number' => $this->generateOrderNumber(),
            'user_id' => $request->user()?->id,
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Pending,
            'subtotal' => $totals['subtotal'],
            'discount_total' => $discount,
            'shipping_total' => $totals['shipping'],
            'tax_total' => $taxTotal,
            'total' => $total,
            'currency' => $totals['currency'],
            'promotion_id' => $promotion?->id,
            'billing_name' => $data['billing_name'],
            'billing_tax_id' => $data['billing_tax_id'] ?? null,
            'billing_email' => $data['billing_email'],
            'billing_phone' => $data['billing_phone'] ?? null,
            'billing_address_line_1' => $data['billing_address_line_1'],
            'billing_address_line_2' => $data['billing_address_line_2'] ?? null,
            'billing_city' => $data['billing_city'],
            'billing_state' => $data['billing_state'] ?? null,
            'billing_postal_code' => $data['billing_postal_code'],
            'billing_country' => $data['billing_country'] ?? 'PT',
            'shipping_name' => $data['shipping_name'],
            'shipping_phone' => $data['shipping_phone'] ?? null,
            'shipping_address_line_1' => $data['shipping_address_line_1'],
            'shipping_address_line_2' => $data['shipping_address_line_2'] ?? null,
            'shipping_city' => $data['shipping_city'],
            'shipping_state' => $data['shipping_state'] ?? null,
            'shipping_postal_code' => $data['shipping_postal_code'],
            'shipping_country' => $data['shipping_country'] ?? 'PT',
            'guest_token' => $request->user() ? null : Str::random(32),
            'idempotency_key' => $idempotencyKey,
        ]);

        $this->syncOrderItems($order, $cart, $totals['vat_rate']);

        return $order;
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $totals
     */
    private function updatePendingOrder(
        Order $order,
        Request $request,
        array $data,
        Cart $cart,
        array $totals,
        ?Promotion $promotion,
        float $discount,
        float $taxTotal,
        float $total,
    ): Order {
        $order->update([
            'user_id' => $request->user()?->id ?? $order->user_id,
            'subtotal' => $totals['subtotal'],
            'discount_total' => $discount,
            'shipping_total' => $totals['shipping'],
            'tax_total' => $taxTotal,
            'total' => $total,
            'currency' => $totals['currency'],
            'promotion_id' => $promotion?->id,
            'billing_name' => $data['billing_name'],
            'billing_tax_id' => $data['billing_tax_id'] ?? null,
            'billing_email' => $data['billing_email'],
            'billing_phone' => $data['billing_phone'] ?? null,
            'billing_address_line_1' => $data['billing_address_line_1'],
            'billing_address_line_2' => $data['billing_address_line_2'] ?? null,
            'billing_city' => $data['billing_city'],
            'billing_state' => $data['billing_state'] ?? null,
            'billing_postal_code' => $data['billing_postal_code'],
            'billing_country' => $data['billing_country'] ?? 'PT',
            'shipping_name' => $data['shipping_name'],
            'shipping_phone' => $data['shipping_phone'] ?? null,
            'shipping_address_line_1' => $data['shipping_address_line_1'],
            'shipping_address_line_2' => $data['shipping_address_line_2'] ?? null,
            'shipping_city' => $data['shipping_city'],
            'shipping_state' => $data['shipping_state'] ?? null,
            'shipping_postal_code' => $data['shipping_postal_code'],
            'shipping_country' => $data['shipping_country'] ?? 'PT',
            'guest_token' => $order->guest_token ?? ($request->user() ? null : Str::random(32)),
        ]);

        $order->items()->delete();
        $this->syncOrderItems($order, $cart, $totals['vat_rate']);

        return $order;
    }

    private function syncOrderItems(Order $order, Cart $cart, float $vatRate): void
    {
        foreach ($cart->items as $item) {
            $lineSubtotal = $item->lineTotal();
            $lineTax = VatCalculator::taxFromNet($lineSubtotal, $vatRate);

            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
                'product_name' => $item->product->name,
                'product_sku' => $item->product->sku,
                'variant_name' => $item->variant?->name,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'subtotal' => $lineSubtotal,
                'tax_amount' => $lineTax,
                'total' => $lineSubtotal,
            ]);
        }
    }

    public function markAsPaid(
        Order $order,
        ?string $chargeId = null,
        ?string $paymentIntentId = null,
        ?string $checkoutSessionId = null,
    ): void {
        if ($order->isPaid()) {
            return;
        }

        DB::transaction(function () use ($order, $chargeId, $paymentIntentId, $checkoutSessionId) {
            $order->update([
                'status' => OrderStatus::Paid,
                'payment_status' => PaymentStatus::Paid,
                'stripe_charge_id' => $chargeId,
                'stripe_payment_intent_id' => $paymentIntentId ?? $order->stripe_payment_intent_id,
                'stripe_checkout_session_id' => $checkoutSessionId ?? $order->stripe_checkout_session_id,
                'paid_at' => now(),
            ]);

            $this->decrementStock($order);

            if ($order->promotion_id) {
                Promotion::query()
                    ->where('id', $order->promotion_id)
                    ->increment('usage_count');
            }

            $this->orderAddresses->syncFromOrder($order->fresh());
        });
    }

    public function clearCheckoutSession(Request $request): void
    {
        $request->session()->forget(['checkout_idempotency_key', 'checkout_order_id']);
    }

    public function customerPaymentUrl(Order $order): ?string
    {
        if ($order->payment_status !== PaymentStatus::Pending) {
            return null;
        }

        $params = ['order' => $order->id];

        if ($order->guest_token) {
            $params['token'] = $order->guest_token;
        }

        return route('checkout.payment', $params, absolute: true);
    }

    public function resolvePaymentClientSecret(Order $order): string
    {
        if ($order->isPaid()) {
            throw new \RuntimeException('Esta encomenda já está paga.');
        }

        if ($order->stripe_checkout_session_id) {
            try {
                $session = $this->stripe->retrieveCheckoutSession(
                    $order->stripe_checkout_session_id,
                );

                if ($session->status !== 'expired' && filled($session->client_secret)) {
                    return $session->client_secret;
                }
            } catch (\Throwable) {
                // Sessão inválida — recriamos abaixo.
            }
        }

        $session = $this->stripe->createCheckoutSession($order);
        $order->update(['stripe_checkout_session_id' => $session->id]);

        if (! filled($session->client_secret)) {
            throw new \RuntimeException('O Stripe não devolveu credenciais de pagamento.');
        }

        return $session->client_secret;
    }

    private function decrementStock(Order $order): void
    {
        $order->load('items');

        foreach ($order->items as $item) {
            if ($item->product_variant_id) {
                $item->variant?->decrement('stock_quantity', $item->quantity);
            } else {
                Product::query()
                    ->where('id', $item->product_id)
                    ->decrement('stock_quantity', $item->quantity);
            }
        }
    }

    private function generateOrderNumber(): string
    {
        return 'LW-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
    }

    private function resolvePromotion(?string $code, Cart $cart, float $subtotal): ?Promotion
    {
        if (! $code) {
            return null;
        }

        $promotion = Promotion::query()
            ->where('code', strtoupper(trim($code)))
            ->active()
            ->first();

        if (! $promotion) {
            throw ValidationException::withMessages([
                'promotion_code' => 'Código promocional inválido ou expirado.',
            ]);
        }

        return $promotion;
    }

    private function calculateDiscount(Promotion $promotion, float $subtotal): float
    {
        return match ($promotion->type->value) {
            'percentage' => round($subtotal * ($promotion->value / 100), 2),
            default => min($subtotal, (float) $promotion->value),
        };
    }
}
