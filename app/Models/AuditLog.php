<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    /**
     * Audit entries are immutable — append-only, no updated_at.
     */
    public const UPDATED_AT = null;

    public const ACTION_CREATED = 'created';

    public const ACTION_UPDATED = 'updated';

    public const ACTION_SUBMITTED_FOR_REVIEW = 'submitted_for_review';

    public const ACTION_CHANGES_REQUESTED = 'changes_requested';

    public const ACTION_APPROVED = 'approved';

    public const ACTION_PUBLISHED = 'published';

    public const ACTION_ARCHIVED = 'archived';

    public const ACTION_RESTORED = 'restored';

    public const ACTION_DELETED = 'deleted';

    public const ACTION_DELETED_ATTEMPTED = 'deleted_attempted';

    protected $fillable = [
        'actor_id', 'action', 'content_type', 'content_id',
        'summary', 'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * Append an immutable audit entry for a governance event.
     * Denials (e.g. a failed deletion attempt) are recorded too.
     */
    public static function log(
        string $action,
        ?int $actorId = null,
        ?string $contentType = null,
        ?int $contentId = null,
        ?string $summary = null,
    ): self {
        $request = request();

        return static::query()->create([
            'actor_id' => $actorId,
            'action' => $action,
            'content_type' => $contentType,
            'content_id' => $contentId,
            'summary' => $summary,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    /**
     * The user who performed the event, when known.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Newest entries first, for the audit screen.
     */
    public static function recent(int $limit = 100): Collection
    {
        return static::query()->latest('id')->limit($limit)->get();
    }
}
