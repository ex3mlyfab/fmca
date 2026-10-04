<?php

namespace Database\Factories;

use App\Models\BrandAsset;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BrandAsset>
 */
class BrandAssetFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slot' => fake()->randomElement(BrandAsset::SLOTS),
            'file_name' => 'asset.png',
            'file_path' => 'brand/'.now()->format('Y/m').'/asset.png',
            'mime_type' => 'image/png',
            'size_bytes' => fake()->numberBetween(8_000, 512_000),
            'alt_text' => null,
            'owner' => 'FMCA Corporate Communications',
            'reviewed_at' => now(),
            'status' => 'draft',
            'created_by' => null,
        ];
    }

    public function inSlot(string $slot): static
    {
        return $this->state([
            'slot' => $slot,
            'file_name' => $slot.'.png',
            'file_path' => 'brand/'.now()->format('Y/m')."/{$slot}.png",
        ]);
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function asIco(): static
    {
        return $this->state([
            'slot' => BrandAsset::SLOT_FAVICON,
            'file_name' => 'favicon.ico',
            'file_path' => 'brand/'.now()->format('Y/m').'/favicon.ico',
            'mime_type' => 'image/x-icon',
        ]);
    }

    public function createdBy(User $user): static
    {
        return $this->state(['created_by' => $user->id]);
    }
}
