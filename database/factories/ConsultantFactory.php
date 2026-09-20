<?php

namespace Database\Factories;

use App\Models\Consultant;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Consultant>
 */
class ConsultantFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->name();

        return [
            'name' => $name,
            'slug' => fake()->unique()->slug(2),
            'specialty' => fake()->randomElement(['Cardiology', 'Oncology', 'Paediatrics', 'Emergency Medicine']),
            'position' => 'Consultant',
            'biography' => fake()->paragraph(),
            'portrait' => null,
            'specialty_tags' => [fake()->word(), fake()->word()],
            'department_id' => null,
            'owner' => 'FMCA Clinical Desk',
            'reviewed_at' => now(),
            'status' => 'draft',
            'created_by' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function inDepartment(Department $department): static
    {
        return $this->state(['department_id' => $department->id]);
    }

    public function createdBy(User $user): static
    {
        return $this->state(['created_by' => $user->id]);
    }
}
