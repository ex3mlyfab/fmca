<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageBlock extends Model
{
    use HasFactory;

    /**
     * The controlled block catalog (PROJECT_PLAN.md "Blocks"). Each block defines
     * its public data shape; editors may only attach a block when the page's
     * template permits its key. `placeholder` is a valid-JSON example shown in
     * the CMS editor's content field.
     *
     * @var array<string, array{label: string, placeholder: string}>
     */
    public const CATALOG = [
        'rich_text' => [
            'label' => 'Rich text',
            'placeholder' => '{"heading": "Optional heading", "body": "Plain text. Use blank lines to separate paragraphs."}',
        ],
        'steps' => [
            'label' => 'Patient steps',
            'placeholder' => '{"title": "What to do", "steps": [{"title": "Step one", "body": "Details for this step."}]}',
        ],
        'alert' => [
            'label' => 'Alert',
            'placeholder' => '{"tone": "info", "title": "Important note", "body": "Brief, factual guidance."}',
        ],
        'faq' => [
            'label' => 'FAQ',
            'placeholder' => '{"title": "Frequently asked questions", "items": [{"question": "Question?", "answer": "Answer."}]}',
        ],
        'document_list' => [
            'label' => 'Document list',
            'placeholder' => '{"title": "Documents", "documents": [{"label": "Document name", "href": "https://example.com/document.pdf", "note": "Optional note"}]}',
        ],
        'cta' => [
            'label' => 'Call to action',
            'placeholder' => '{"label": "Find patient services", "href": "/services"}',
        ],
        'contact_panel' => [
            'label' => 'Contact panel',
            'placeholder' => '{"title": "How to reach us", "note": "Optional note shown above the contact details."}',
        ],
    ];

    protected $fillable = [
        'page_id',
        'block_key',
        'content',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * The full list of permitted block keys.
     *
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_keys(self::CATALOG);
    }

    /**
     * The catalog entries for a set of permitted block keys.
     *
     * @param  array<int, string>  $keys
     * @return array<int, array<string, string>>
     */
    public static function entries(array $keys): array
    {
        return collect($keys)
            ->filter(fn (string $key): bool => array_key_exists($key, self::CATALOG))
            ->map(fn (string $key) => ['key' => $key, ...self::CATALOG[$key]])
            ->all();
    }
}
