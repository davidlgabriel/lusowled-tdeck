<?php

namespace Database\Factories;

use App\Enums\AddressType;
use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(AddressType::cases()),
            'label' => fake()->optional()->randomElement(['Casa', 'Escritório', 'Armazém']),
            'name' => fake()->name(),
            'tax_id' => fake()->optional()->numerify('#########'),
            'address_line_1' => fake()->streetAddress(),
            'address_line_2' => fake()->optional()->secondaryAddress(),
            'city' => fake()->city(),
            'state' => fake()->randomElement(['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro']),
            'postal_code' => fake()->numerify('####-###'),
            'country' => 'PT',
            'phone' => fake()->numerify('9########'),
            'is_default' => false,
        ];
    }

    public function billing(): static
    {
        return $this->state(fn () => ['type' => AddressType::Billing]);
    }

    public function shipping(): static
    {
        return $this->state(fn () => ['type' => AddressType::Shipping]);
    }

    public function default(): static
    {
        return $this->state(fn () => ['is_default' => true]);
    }
}
