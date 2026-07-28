<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $basePrice = fake()->randomFloat(2, 9.99, 299.99);
        $onSale = fake()->boolean(30);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraphs(3, true),
            'sku' => strtoupper(Str::random(8)),
            'base_price' => $basePrice,
            'sale_price' => $onSale ? round($basePrice * 0.85, 2) : null,
            'is_featured' => fake()->boolean(20),
            'status' => ProductStatus::Active,
            'stock_quantity' => fake()->numberBetween(0, 200),
            'low_stock_threshold' => 5,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => ProductStatus::Draft]);
    }

    public function featured(): static
    {
        return $this->state(fn () => ['is_featured' => true]);
    }

    public function lowStock(): static
    {
        return $this->state(fn () => [
            'stock_quantity' => fake()->numberBetween(0, 3),
            'low_stock_threshold' => 5,
        ]);
    }

    public function onSale(): static
    {
        return $this->state(function (array $attributes) {
            $base = $attributes['base_price'] ?? fake()->randomFloat(2, 19.99, 199.99);

            return [
                'base_price' => $base,
                'sale_price' => round($base * 0.8, 2),
            ];
        });
    }
}
