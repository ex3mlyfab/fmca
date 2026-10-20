<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class HomeConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'status', 'sections', 'created_by', 'approved_by',
        'reviewed_at', 'publish_at', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'sections' => 'array',
            'reviewed_at' => 'datetime',
            'publish_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published')
            ->where(function (Builder $query): void {
                $query->whereNull('publish_at')->orWhere('publish_at', '<=', now());
            });
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled' && $this->publish_at instanceof Carbon;
    }
}
