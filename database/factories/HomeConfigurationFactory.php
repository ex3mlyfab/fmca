<?php

namespace Database\Factories;

use App\Models\HomeConfiguration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HomeConfiguration>
 */
class HomeConfigurationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status' => 'draft',
            'sections' => [],
        ];
    }
}
