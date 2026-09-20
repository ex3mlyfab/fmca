<?php

namespace Database\Factories;

use App\Models\ContentRevision;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContentRevision>
 */
class ContentRevisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_type' => 'home',
            'content_id' => 1,
            'revision' => 1,
            'status' => 'draft',
            'sections' => ['hero' => ['title' => 'Care information you can trust']],
            'created_by' => fn () => User::factory(),
        ];
    }

    /**
     * A snapshot of published content.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'published',
        ]);
    }
}
