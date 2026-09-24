<?php

namespace Database\Factories;

use App\Models\Page;
use App\Models\PageBlock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PageBlock>
 */
class PageBlockFactory extends Factory
{
    public function definition(): array
    {
        return [
            'page_id' => Page::factory(),
            'block_key' => 'rich_text',
            'content' => [
                'heading' => fake()->sentence(3),
                'body' => '<p>'.fake()->paragraph().'</p>',
            ],
            'sort_order' => 0,
        ];
    }

    public function richText(): static
    {
        return $this->state([
            'block_key' => 'rich_text',
            'content' => [
                'heading' => fake()->sentence(3),
                'body' => '<p>'.fake()->paragraph().'</p>',
            ],
        ]);
    }

    public function steps(): static
    {
        return $this->state([
            'block_key' => 'steps',
            'content' => [
                'title' => fake()->sentence(3),
                'steps' => [
                    ['title' => fake()->sentence(3), 'body' => fake()->sentence()],
                    ['title' => fake()->sentence(3), 'body' => fake()->sentence()],
                ],
            ],
        ]);
    }

    public function alert(): static
    {
        return $this->state([
            'block_key' => 'alert',
            'content' => [
                'tone' => 'info',
                'title' => fake()->sentence(3),
                'body' => fake()->sentence(),
            ],
        ]);
    }

    public function faq(): static
    {
        return $this->state([
            'block_key' => 'faq',
            'content' => [
                'title' => 'Frequently asked questions',
                'items' => [
                    ['question' => fake()->sentence(3), 'answer' => fake()->sentence()],
                    ['question' => fake()->sentence(3), 'answer' => fake()->sentence()],
                ],
            ],
        ]);
    }

    public function documentList(): static
    {
        return $this->state([
            'block_key' => 'document_list',
            'content' => [
                'title' => fake()->sentence(3),
                'documents' => [
                    ['label' => fake()->sentence(2), 'href' => 'https://example.com/document.pdf'],
                ],
            ],
        ]);
    }

    public function cta(): static
    {
        return $this->state([
            'block_key' => 'cta',
            'content' => [
                'label' => 'Find patient services',
                'href' => '/services',
            ],
        ]);
    }

    public function contactPanel(): static
    {
        return $this->state([
            'block_key' => 'contact_panel',
            'content' => [
                'title' => 'How to reach us',
                'note' => fake()->sentence(),
            ],
        ]);
    }
}
