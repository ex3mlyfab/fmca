<?php

namespace Database\Factories;

use App\Models\AppointmentRequest;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AppointmentRequest>
 */
class AppointmentRequestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'department_id' => null,
            'preferred_service' => fake()->sentence(4),
            'preferred_date' => fake()->date(),
            'reason' => fake()->sentence(10),
            'consent' => true,
            'status' => 'new',
        ];
    }

    public function contacted(): static
    {
        return $this->state(['status' => 'contacted']);
    }

    public function resolved(): static
    {
        return $this->state(['status' => 'resolved']);
    }

    public function closed(): static
    {
        return $this->state(['status' => 'closed']);
    }

    public function withoutConsent(): static
    {
        return $this->state(['consent' => false]);
    }

    public function forDepartment(Department $department): static
    {
        return $this->state(fn () => ['department_id' => $department->id]);
    }
}
