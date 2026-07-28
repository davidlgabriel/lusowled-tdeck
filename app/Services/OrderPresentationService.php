<?php

namespace App\Services;

use App\Enums\AddressType;
use App\Models\Order;
use App\Models\User;
use App\Support\StorefrontData;

class OrderPresentationService
{
    /**
     * @return array<string, mixed>
     */
    public function summary(Order $order): array
    {
        $order->loadMissing(['items.product.images']);

        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'payment_status' => $order->payment_status->value,
            'payment_status_label' => $order->payment_status->label(),
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'created_at' => $order->created_at?->toIso8601String(),
            'items_count' => $order->items->count(),
            'has_invoice' => $order->invoice_path !== null,
            'preview_images' => $this->previewImages($order),
            'preview_overflow' => max(0, $order->items->count() - 3),
        ];
    }

    /**
     * @return list<string>
     */
    private function previewImages(Order $order): array
    {
        $images = [];

        foreach ($order->items as $item) {
            $image = $item->product?->images->firstWhere('is_primary', true)
                ?? $item->product?->images->first();

            $url = StorefrontData::imageUrl($image);

            if ($url && ! in_array($url, $images, true)) {
                $images[] = $url;
            }

            if (count($images) >= 3) {
                break;
            }
        }

        return $images;
    }
}
