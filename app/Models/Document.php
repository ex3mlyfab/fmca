<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'summary',
        'file_name',
        'file_path',
        'mime_type',
        'size_bytes',
        'issuing_unit',
        'issue_date',
        'owner',
        'reviewed_at',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'issue_date' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Only documents that are safe to serve publicly.
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
