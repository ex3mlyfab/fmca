<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeoMetadata extends Model
{
    use HasFactory;

    protected $fillable = [
        'content_type', 'content_id', 'title', 'meta_description',
        'canonical_url', 'og_image_url', 'robots', 'structured_data',
    ];

    protected function casts(): array
    {
        return [
            'content_id' => 'integer',
            'structured_data' => 'array',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function onlyViewFields(): array
    {
        return $this->only(['title', 'meta_description', 'canonical_url', 'og_image_url', 'robots', 'structured_data']);
    }

    public function scopeFor(Builder $query, string $contentType, ?int $contentId): Builder
    {
        $query->where('content_type', $contentType);

        return $contentId === null
            ? $query->whereNull('content_id')
            : $query->where('content_id', $contentId);
    }

    /**
     * The row for a piece of content, when one exists.
     */
    public static function rowFor(string $contentType, ?int $contentId): ?self
    {
        return static::query()->for($contentType, $contentId)->first();
    }

    /**
     * Merge a content row's overrides on top of the defaults a controller
     * computed for that page type. A null row (or absent fields) leaves the
     * default in place.
     *
     * @param  array{title: string, description: string|null, canonical: string, og_image: string|null, robots: string, json_ld: array|null}  $defaults
     * @return array<string, mixed>
     */
    public static function forView(string $contentType, ?int $contentId, array $defaults): array
    {
        $row = static::query()->for($contentType, $contentId)->first();

        $merged = $defaults;

        if ($row !== null) {
            if ($row->title !== null) {
                $merged['title'] = $row->title;
            }

            if ($row->meta_description !== null) {
                $merged['description'] = $row->meta_description;
            }

            if ($row->canonical_url !== null) {
                $merged['canonical'] = $row->canonical_url;
            }

            if ($row->og_image_url !== null) {
                $merged['og_image'] = $row->og_image_url;
            }

            if ($row->robots !== null && $row->robots !== '') {
                $merged['robots'] = $row->robots;
            }

            if ($row->structured_data !== null) {
                $merged['json_ld'] = $row->structured_data;
            }
        }

        return $merged;
    }

    /**
     * Build a schema.org BreadcrumbList block.
     *
     * @param  array<int, array{name: string, url: string}>  $items
     * @return array<string, mixed>
     */
    public static function breadcrumbs(array $items): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => collect($items)
                ->values()
                ->map(fn (array $item, int $position) => [
                    '@type' => 'ListItem',
                    'position' => $position + 1,
                    'name' => $item['name'],
                    'item' => $item['url'],
                ])->all(),
        ];
    }
}
