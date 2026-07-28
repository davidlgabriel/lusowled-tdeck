<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\CheckoutService;
use App\Services\StripeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly StripeService $stripe,
        private readonly CheckoutService $checkout,
    ) {}

    public function index(Request $request): Response
    {
        $query = Order::query()->with('user')->latest();

        if ($search = $request->string('q')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('billing_email', 'like', "%{$search}%")
                    ->orWhere('billing_name', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders->through(fn (Order $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => $order->user?->name ?? $order->billing_name,
                'email' => $order->billing_email,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'payment_status' => $order->payment_status->value,
                'payment_status_label' => $order->payment_status->label(),
                'total' => (float) $order->total,
                'currency' => $order->currency,
                'created_at' => $order->created_at?->toIso8601String(),
            ]),
            'filters' => [
                'q' => $search ?? '',
                'status' => $status ?? '',
            ],
            'statuses' => collect(OrderStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    public function show(Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load(['items', 'user', 'notes.author']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $this->formatOrderDetail($order),
            'statuses' => collect(OrderStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
            ]),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $this->authorize('view', $order);

        $status = OrderStatus::from($request->string('status')->toString());
        $updates = ['status' => $status];

        if ($status === OrderStatus::Shipped) {
            $updates['shipped_at'] = now();
        }

        if ($status === OrderStatus::Completed) {
            $updates['completed_at'] = now();
        }

        if ($status === OrderStatus::Cancelled) {
            $updates['cancelled_at'] = now();
        }

        $order->update($updates);

        return Redirect::back()->with('success', 'Estado da encomenda atualizado.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatOrderDetail(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'payment_status' => $order->payment_status->value,
            'payment_status_label' => $order->payment_status->label(),
            'stripe_payment_intent_id' => $order->stripe_payment_intent_id,
            'stripe_checkout_session_id' => $order->stripe_checkout_session_id,
            'stripe_charge_id' => $order->stripe_charge_id,
            'stripe_dashboard_url' => $this->stripe->dashboardCheckoutSessionUrl($order->stripe_checkout_session_id)
                ?? $this->stripe->dashboardPaymentUrl($order->stripe_payment_intent_id),
            'payment_url' => $this->checkout->customerPaymentUrl($order),
            'subtotal' => (float) $order->subtotal,
            'discount_total' => (float) $order->discount_total,
            'shipping_total' => (float) $order->shipping_total,
            'tax_total' => (float) $order->tax_total,
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'billing' => [
                'name' => $order->billing_name,
                'tax_id' => $order->billing_tax_id,
                'email' => $order->billing_email,
                'phone' => $order->billing_phone,
            ],
            'shipping' => [
                'name' => $order->shipping_name,
                'phone' => $order->shipping_phone,
            ],
            'items' => $order->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'product_sku' => $item->product_sku,
                'variant_name' => $item->variant_name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ]),
            'created_at' => $order->created_at?->toIso8601String(),
            'paid_at' => $order->paid_at?->toIso8601String(),
        ];
    }
}
