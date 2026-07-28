<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CartItem>
 */
class CartItemFactory extends Factory
{
    public function definition(): array
    {
        $product = Product::factory()->create();

        return [
            'cart_id' => Cart::factory(),
            'product_id' => $product->id,
            'product_variant_id' => null,
            'quantity' => fake()->numberBetween(1, 3),
            'unit_price' => $product->currentPrice(),
        ];
    }
}
