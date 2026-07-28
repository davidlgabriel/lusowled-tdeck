<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        $product = Product::factory()->create();
        $quantity = fake()->numberBetween(1, 3);
        $unitPrice = $product->currentPrice();
        $subtotal = round($unitPrice * $quantity, 2);
        $tax = round($subtotal * 0.23, 2);

        return [
            'order_id' => Order::factory(),
            'product_id' => $product->id,
            'product_variant_id' => null,
            'product_name' => $product->name,
            'product_sku' => $product->sku,
            'variant_name' => null,
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total' => round($subtotal + $tax, 2),
        ];
    }
}
