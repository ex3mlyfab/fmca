<?php

namespace Database\Factories;

use App\Models\CommitteeMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommitteeMember>
 */
class CommitteeMemberFactory extends Factory
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
            'role' => fake()->randomElement([
                'Executive Chairperson',
                'Director-General',
                'Pro-Vice-Chancellor',
                'Head of Corporate Services',
            ]),
            'portfolio' => 'Institutional Governance',
            'mandate' => fake()->paragraph(),
            'term' => null,
            'sort_order' => 0,
            'portrait' => null,
            'owner' => 'FMCA Corporate Communications',
            'reviewed_at' => now(),
            'status' => 'draft',
            'created_by' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function inRole(string $role): static
    {
        return $this->state(['role' => $role]);
    }

    public function createdBy(User $user): static
    {
        return $this->state(['created_by' => $user->id]);
    }
}
