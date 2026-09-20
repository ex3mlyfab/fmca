<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultant extends Model
{
    use HasFactory;

    /** @var array<int, string> */
    protected $fillable = [
        'name',
        'slug',
        'specialty',
        'position',
        'biography',
        'portrait',
        'specialty_tags',
        'department_id',
        'owner',
        'reviewed_at',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'specialty_tags' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Only consultant profiles that are safe to surface publicly.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
