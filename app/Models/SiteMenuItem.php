<?php

namespace App\Models;

use Database\Factories\SiteMenuItemFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteMenuItem extends Model
{
    /** @use HasFactory<SiteMenuItemFactory> */
    use HasFactory;

    protected $fillable = [
        'label',
        'href',
        'sort_order',
        'owner',
        'reviewed_at',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Only menu items that should appear in the public header navigation.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
