<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'eyebrow',
        'copy',
        'primary_cta_label',
        'primary_cta_href',
        'secondary_cta_label',
        'secondary_cta_href',
        'desktop_media',
        'mobile_media',
        'media_alt',
        'focal_point',
        'video_poster',
        'overlay_intensity',
        'owner',
        'advisory',
        'start_date',
        'end_date',
        'sort_order',
        'status',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'advisory' => 'boolean',
            'start_date' => 'date',
            'end_date' => 'date',
            'reviewed_at' => 'datetime',
            'overlay_intensity' => 'integer',
        ];
    }

    /**
     * Only campaigns that are safe to surface on the public home page.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    /**
     * Published campaigns whose publication window includes today.
     */
    public function scopeActive(Builder $query): void
    {
        $query->published()
            ->where(function (Builder $query) {
                $query->whereNull('start_date')->orWhereDate('start_date', '<=', now());
            })
            ->where(function (Builder $query) {
                $query->whereNull('end_date')->orWhereDate('end_date', '>=', now());
            })
            ->orderBy('sort_order')
            ->orderBy('id');
    }
}
