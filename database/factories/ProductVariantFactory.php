<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        $size = fake()->randomElement(['S', 'M', 'L', 'XL']);
        $color = fake()->safeColorName();

        return [
            'product_id' => Product::factory(),
            'name' => "{$size} / {$color}",
            'sku' => strtoupper(Str::random(10)),
            'options' => ['size' => $size, 'color' => $color],
            'price' => null,
            'stock_quantity' => fake()->numberBetween(0, 50),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
