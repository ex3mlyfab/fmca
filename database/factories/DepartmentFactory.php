<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'slug' => fake()->unique()->slug(2),
            'summary' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'contact_phone' => null,
            'contact_email' => null,
            'owner' => fake()->name(),
            'reviewed_at' => now(),
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function withContact(): static
    {
        return $this->state([
            'contact_phone' => '08000000000',
            'contact_email' => 'clinical-desk@example.com',
        ]);
    }
}
