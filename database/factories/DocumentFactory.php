<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * The current state of the model's attributes.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->words(3, true),
            'summary' => $this->faker->sentence(),
            'file_name' => $this->faker->uuid().'.pdf',
            'file_path' => 'documents/'.$this->faker->year().'/'.str_pad((string) $this->faker->month(), 2, '0', STR_PAD_LEFT).'/'.$this->faker->uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => $this->faker->numberBetween(50_000, 5_000_000),
            'issuing_unit' => 'FMCA Corporate Services',
            'issue_date' => $this->faker->date('Y-m-d'),
            'owner' => 'FMCA Corporate Services',
            'reviewed_at' => now(),
            'status' => 'draft',
            'created_by' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }

    public function createdBy(User $user): static
    {
        return $this->state(['created_by' => $user->id]);
    }
}
