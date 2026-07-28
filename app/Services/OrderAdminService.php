<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderAdminService
{
    public function delete(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->load('items');

            if ($order->paid_at !== null) {
                $this->restoreStock($order);
                $this->restorePromotionUsage($order);
            }

            if ($order->invoice_path) {
                Storage::disk(config('filesystems.default', 'local'))->delete($order->invoice_path);
            }

            $order->delete();
        });
    }

    private function restoreStock(Order $order): void
    {
        foreach ($order->items as $item) {
            if ($item->product_variant_id) {
                $item->variant?->increment('stock_quantity', $item->quantity);
            } elseif ($item->product_id) {
                Product::query()
                    ->where('id', $item->product_id)
                    ->increment('stock_quantity', $item->quantity);
            }
        }
    }

    private function restorePromotionUsage(Order $order): void
    {
        if (! $order->promotion_id) {
            return;
        }

        Promotion::query()
            ->where('id', $order->promotion_id)
            ->where('usage_count', '>', 0)
            ->decrement('usage_count');
    }
}
