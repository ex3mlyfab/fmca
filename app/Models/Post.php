<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'body',
        'feature_image',
        'feature_image_alt',
        'category_id',
        'author',
        'publish_date',
        'owner',
        'reviewed_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'publish_date' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Only news and notices that are safe to surface publicly.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
