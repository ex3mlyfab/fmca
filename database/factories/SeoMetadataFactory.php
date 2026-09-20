<?php

namespace Database\Factories;

use App\Models\SeoMetadata;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SeoMetadata>
 */
class SeoMetadataFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_type' => 'page',
            'content_id' => fake()->numberBetween(1, 100),
            'title' => fake()->sentence(4),
            'meta_description' => fake()->sentence(12),
            'canonical_url' => fake()->url(),
            'og_image_url' => fake()->imageUrl(),
            'robots' => 'index,follow',
            'structured_data' => null,
        ];
    }

    /**
     * An override with only the fields an editor is likely to set; the rest
     * stay null so the controller defaults apply.
     */
    public function minimal(): static
    {
        return $this->state([
            'title' => null,
            'meta_description' => null,
            'canonical_url' => null,
            'og_image_url' => null,
            'structured_data' => null,
        ]);
    }
}
