<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'slug' => fake()->unique()->slug(4),
            'summary' => fake()->sentence(),
            'body' => fake()->paragraph(),
            'category_id' => null,
            'author' => fake()->name(),
            'publish_date' => now()->toDateString(),
            'owner' => fake()->name(),
            'reviewed_at' => now(),
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function inCategory(Category $category): static
    {
        return $this->state(fn () => ['category_id' => $category->id]);
    }
}
