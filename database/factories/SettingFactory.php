<?php

namespace Database\Factories;

use App\Enums\SettingType;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'key' => 'test.'.fake()->unique()->word(),
            'value' => fake()->word(),
            'type' => SettingType::String,
            'group' => 'test',
            'label' => fake()->words(2, true),
            'description' => null,
            'is_public' => false,
        ];
    }
}
