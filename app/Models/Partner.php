<?php

namespace App\Models;

use Database\Factories\PartnerFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partner extends Model
{
    /** @use HasFactory<PartnerFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'website_url',
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
     * Only partners that the communications team has cleared for the
     * public home page.
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
