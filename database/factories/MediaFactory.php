<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => $this->faker->words(3, true),
            'kind' => 'image',
            'file_name' => $this->faker->uuid().'.jpg',
            'file_path' => $this->assetPath('jpg'),
            'mime_type' => 'image/jpeg',
            'size_bytes' => $this->faker->numberBetween(10_000, 2_000_000),
            'alt_text' => $this->faker->sentence(),
            'owner' => 'FMCA Communications',
            'reviewed_at' => now(),
            'created_by' => null,
        ];
    }

    public function video(): static
    {
        return $this->state([
            'kind' => 'video',
            'file_name' => $this->faker->uuid().'.mp4',
            'file_path' => $this->assetPath('mp4'),
            'mime_type' => 'video/mp4',
        ]);
    }

    public function uploadedBy(User $user): static
    {
        return $this->state(['created_by' => $user->id]);
    }

    private function assetPath(string $extension): string
    {
        return 'media/'.$this->faker->year().'/'.str_pad((string) $this->faker->month(), 2, '0', STR_PAD_LEFT).'/'.$this->faker->uuid().'.'.$extension;
    }
}
