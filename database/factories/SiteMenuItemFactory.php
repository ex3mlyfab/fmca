<?php

namespace Database\Factories;

use App\Models\SiteMenuItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteMenuItem>
 */
class SiteMenuItemFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => fake()->randomElement(['Services', 'Patients & Visitors', 'News & Updates', 'About FMCA']),
            'href' => '/'.fake()->unique()->slug(1),
            'sort_order' => 0,
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

    public function withTarget(string $label, string $href, int $sortOrder = 0): static
    {
        return $this->state([
            'label' => $label,
            'href' => $href,
            'sort_order' => $sortOrder,
        ]);
    }

    public function createdBy(User $user): static
    {
        return $this->state(['created_by' => $user->id]);
    }
}
