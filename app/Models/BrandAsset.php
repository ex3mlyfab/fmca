<?php

namespace App\Models;

use Database\Factories\BrandAssetFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class BrandAsset extends Model
{
    /** @use HasFactory<BrandAssetFactory> */
    use HasFactory;

    public const SLOT_HEADER_LOGO = 'header_logo';

    public const SLOT_FOOTER_LOGO = 'footer_logo';

    public const SLOT_FAVICON = 'favicon';

    public const SLOT_APPLE_TOUCH_ICON = 'apple_touch_icon';

    public const SLOTS = [
        self::SLOT_HEADER_LOGO,
        self::SLOT_FOOTER_LOGO,
        self::SLOT_FAVICON,
        self::SLOT_APPLE_TOUCH_ICON,
    ];

    /**
     * Only the logos are rendered as meaningful imagery, so only they carry
     * alt text. Favicon and home screen icons are decorative and announced
     * nowhere by a screen reader, so a stored alt value would be dead data.
     */
    public static function acceptsAltText(string $slot): bool
    {
        return $slot === self::SLOT_HEADER_LOGO || $slot === self::SLOT_FOOTER_LOGO;
    }

    /**
     * Upload rules per slot. Favicon slots deliberately exclude SVG: a favicon
     * is fetched by the browser as a standalone document rather than rendered
     * inside an <img>, and script-bearing SVG favicons are a known XSS class.
     * Logos are always rendered inside <img>, so vector is safe there.
     *
     * @return array<string, list<string>>
     */
    public static function allowedMimeTypes(string $slot): array
    {
        return match ($slot) {
            self::SLOT_HEADER_LOGO, self::SLOT_FOOTER_LOGO => [
                'image/png',
                'image/jpeg',
                'image/webp',
                'image/svg+xml',
            ],
            self::SLOT_FAVICON => [
                'image/x-icon',
                'image/vnd.microsoft.icon',
                'image/png',
                'image/jpeg',
                'image/webp',
            ],
            self::SLOT_APPLE_TOUCH_ICON => ['image/png'],
            default => [],
        };
    }

    /**
     * Human-facing slot catalogue: label, where it appears, and the format
     * hint an editor needs to know what to upload.
     *
     * @return array<string, array{label: string, surface: string, formats: string}>
     */
    public static function slotCatalogue(): array
    {
        return [
            self::SLOT_HEADER_LOGO => [
                'label' => 'Header logo',
                'surface' => 'Public site header, beside the primary navigation.',
                'formats' => 'PNG, JPEG, WebP or SVG',
            ],
            self::SLOT_FOOTER_LOGO => [
                'label' => 'Footer logo',
                'surface' => 'Public site footer, on the dark institutional band.',
                'formats' => 'PNG, JPEG, WebP or SVG',
            ],
            self::SLOT_FAVICON => [
                'label' => 'Browser tab icon',
                'surface' => 'The icon next to the page title in browser tabs and bookmarks.',
                'formats' => 'ICO, PNG, JPEG or WebP',
            ],
            self::SLOT_APPLE_TOUCH_ICON => [
                'label' => 'Mobile home screen icon',
                'surface' => 'The icon iOS and Android use when a visitor saves FMCA to the home screen.',
                'formats' => 'PNG only',
            ],
        ];
    }

    protected $fillable = [
        'slot',
        'file_name',
        'file_path',
        'mime_type',
        'size_bytes',
        'alt_text',
        'owner',
        'reviewed_at',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Only assets approved for public display.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The public URL of the stored asset.
     */
    public function url(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * The published asset for each slot, ready to render on the public site.
     * A slot with no published asset resolves to null so the caller can fall
     * back to the built-in emblem and the static public/ icon files.
     *
     * @return array<string, array{url: string, alt: string, mime: string}|null>
     */
    public static function publishedIdentity(): array
    {
        // Eloquent's `only()` filters by primary key, not by collection key,
        // so the slot filter has to live on the query.
        $published = static::query()
            ->published()
            ->whereIn('slot', static::SLOTS)
            ->get()
            ->keyBy('slot')
            ->map(fn (self $asset): array => [
                'url' => $asset->url(),
                'alt' => $asset->alt_text ?? '',
                'mime' => $asset->mime_type,
            ])
            ->all();

        // array_merge rather than `+`: the union operator would keep the
        // placeholder nulls and never let a published asset through.
        return array_merge(
            array_fill_keys(static::SLOTS, null),
            $published,
        );
    }
}
