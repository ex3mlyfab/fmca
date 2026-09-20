<?php

namespace Database\Factories;

use App\Models\Page;
use App\Models\PageTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'template_id' => fn () => PageTemplate::query()->where('key', 'patient_guide')->first()
                ?? PageTemplate::factory()->create(),
            'title' => fake()->sentence(4),
            'slug' => fake()->unique()->slug(3),
            'summary' => fake()->sentence(),
            'owner' => 'FMCA Communications',
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function reviewed(): static
    {
        return $this->state(['status' => 'review']);
    }
}
