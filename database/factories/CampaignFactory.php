<?php

namespace Database\Factories;

use App\Models\Campaign;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Campaign>
 */
class CampaignFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'eyebrow' => fake()->sentence(3),
            'copy' => fake()->paragraph(),
            'primary_cta_label' => 'Find patient services',
            'primary_cta_href' => '#services',
            'secondary_cta_label' => 'About FMCA',
            'secondary_cta_href' => '#about',
            'owner' => 'FMCA Communications',
            'advisory' => false,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
            'sort_order' => 0,
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function advisory(): static
    {
        return $this->state(['advisory' => true]);
    }

    public function alwaysOn(): static
    {
        return $this->state(['start_date' => null, 'end_date' => null]);
    }
}
