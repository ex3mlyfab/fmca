<?php

namespace Database\Factories;

use App\Models\InstituteProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InstituteProfile>
 */
class InstituteProfileFactory extends Factory
{
    protected $model = InstituteProfile::class;

    /**
     * The model's default values. Prose is clearly placeholder and makes no
     * clinical, fee, or availability claim (see PROJECT_PLAN.md).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->bothify('Institution ??#');

        return [
            'institution_name' => $name,
            'about_intro' => 'This is a placeholder description of the institute.',
            'history_body' => '<p>A placeholder history.</p>',
            'history_milestones' => [
                ['year' => '2000', 'title' => 'Foundation', 'body' => 'A placeholder milestone.'],
            ],
            'general_email' => fake()->unique()->safeEmail(),
            'general_phone' => '08000000000',
            'emergency_phone' => '09000000000',
            'emergency_label' => 'Emergency line',
            'campus_name' => $name,
            'address_lines' => [fake()->streetAddress()],
            'location_address' => fake()->address(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'map_zoom' => 16,
            'owner' => 'FMCA Corporate Communications',
            'reviewed_at' => now(),
            'status' => InstituteProfile::STATUS_DRAFT,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes): array => ['status' => InstituteProfile::STATUS_PUBLISHED]);
    }
}
