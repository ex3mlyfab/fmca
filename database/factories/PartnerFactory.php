<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Partner>
 */
class PartnerFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'logo' => '/media/2026/09/partner-logo.png',
            'website_url' => null,
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

    public function withWebsite(string $url): static
    {
        return $this->state(['website_url' => $url]);
    }

    public function createdBy(User $user): static
    {
        return $this->state(['created_by' => $user->id]);
    }
}
