<?php

namespace Database\Factories;

use App\Enums\PromotionAppliesTo;
use App\Enums\PromotionType;
use App\Models\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Promotion>
 */
class PromotionFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(PromotionType::cases());

        return [
            'name' => fake()->words(3, true),
            'code' => strtoupper(Str::random(8)),
            'description' => fake()->optional()->sentence(),
            'type' => $type,
            'value' => $type === PromotionType::Percentage
                ? fake()->numberBetween(5, 25)
                : fake()->randomFloat(2, 5, 50),
            'applies_to' => PromotionAppliesTo::All,
            'starts_at' => now()->subDays(1),
            'ends_at' => now()->addDays(30),
            'usage_limit' => fake()->optional()->numberBetween(10, 500),
            'usage_count' => 0,
            'is_active' => true,
        ];
    }

    public function percentage(float $value = 10): static
    {
        return $this->state(fn () => [
            'type' => PromotionType::Percentage,
            'value' => $value,
        ]);
    }

    public function fixed(float $value = 10): static
    {
        return $this->state(fn () => [
            'type' => PromotionType::FixedAmount,
            'value' => $value,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'starts_at' => now()->subDays(30),
            'ends_at' => now()->subDays(1),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['is_active' => false]);
    }
}
