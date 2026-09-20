<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContentRevision extends Model
{
    use HasFactory;

    /**
     * Revisions are immutable snapshots — append-only, no updated_at.
     */
    public const UPDATED_AT = null;

    protected $fillable = [
        'content_type', 'content_id', 'revision', 'status',
        'sections', 'summary', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'sections' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Append an immutable snapshot of the given content and return it.
     * The revision sequence is per content row and increments from 1.
     */
    public static function snapshot(
        string $contentType,
        int $contentId,
        string $status,
        ?array $sections,
        ?int $createdBy,
        ?string $summary = null,
    ): self {
        $nextRevision = (int) static::query()
            ->where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->max('revision') + 1;

        return static::query()->create([
            'content_type' => $contentType,
            'content_id' => $contentId,
            'revision' => $nextRevision,
            'status' => $status,
            'sections' => $sections,
            'summary' => $summary,
            'created_by' => $createdBy,
        ]);
    }

    /**
     * Newest-first revision history for a single content row.
     */
    public static function historyFor(string $contentType, int $contentId, int $limit = 50): Collection
    {
        return static::query()
            ->where('content_type', $contentType)
            ->where('content_id', $contentId)
            ->orderByDesc('revision')
            ->limit($limit)
            ->get();
    }

    /**
     * The user who captured this snapshot, when known.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
