<?php

namespace App\Models;

use Database\Factories\CommitteeMemberFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitteeMember extends Model
{
    /** @use HasFactory<CommitteeMemberFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'role',
        'portfolio',
        'mandate',
        'term',
        'sort_order',
        'portrait',
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
     * Only committee member profiles that are safe to surface publicly.
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
