<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CheckoutService;
use App\Services\OrderPresentationService;
use App\Support\StorefrontData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderPresentationService $orders,
        private readonly CheckoutService $checkout,
    ) {}

    public function index(Request $request): Response
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product.images'])
            ->latest()
            ->paginate(10)
            ->through(fn (Order $order) => $this->orders->summary($order));

        return Inertia::render('Account/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load(['items.product.images']);

        return Inertia::render('Account/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'payment_status' => $order->payment_status->value,
                'payment_status_label' => $order->payment_status->label(),
                'subtotal' => (float) $order->subtotal,
                'discount_total' => (float) $order->discount_total,
                'shipping_total' => (float) $order->shipping_total,
                'tax_total' => (float) $order->tax_total,
                'total' => (float) $order->total,
                'currency' => $order->currency,
                'created_at' => $order->created_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->toIso8601String(),
                'shipped_at' => $order->shipped_at?->toIso8601String(),
                'preview_images' => $this->orders->summary($order)['preview_images'],
                'billing' => [
                    'name' => $order->billing_name,
                    'tax_id' => $order->billing_tax_id,
                    'email' => $order->billing_email,
                    'phone' => $order->billing_phone,
                    'address' => implode(', ', array_filter([
                        $order->billing_address_line_1,
                        $order->billing_address_line_2,
                        "{$order->billing_postal_code} {$order->billing_city}",
                    ])),
                ],
                'shipping' => [
                    'name' => $order->shipping_name,
                    'phone' => $order->shipping_phone,
                    'address' => implode(', ', array_filter([
                        $order->shipping_address_line_1,
                        $order->shipping_address_line_2,
                        "{$order->shipping_postal_code} {$order->shipping_city}",
                    ])),
                ],
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'product_sku' => $item->product_sku,
                    'variant_name' => $item->variant_name,
                    'unit_price' => (float) $item->unit_price,
                    'quantity' => $item->quantity,
                    'total' => (float) $item->total,
                    'image_url' => StorefrontData::imageUrl(
                        $item->product?->images->firstWhere('is_primary', true)
                            ?? $item->product?->images->first(),
                    ),
                ]),
                'has_invoice' => $order->invoice_path !== null,
                'invoice_number' => $order->invoice_number,
                'payment_url' => $this->checkout->customerPaymentUrl($order),
            ],
        ]);
    }

    public function downloadInvoice(Request $request, Order $order): StreamedResponse
    {
        $this->authorize('downloadInvoice', $order);

        $disk = config('filesystems.default', 'local');

        return Storage::disk($disk)->download(
            $order->invoice_path,
            "fatura-{$order->order_number}.pdf"
        );
    }
}
