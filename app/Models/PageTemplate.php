<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PageTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'purpose',
        'url_prefix',
        'routable',
        'requires_owner',
        'requires_summary',
        'required_fields',
        'permitted_blocks',
        'default_owner',
    ];

    protected function casts(): array
    {
        return [
            'routable' => 'boolean',
            'requires_owner' => 'boolean',
            'requires_summary' => 'boolean',
            'required_fields' => 'array',
            'permitted_blocks' => 'array',
        ];
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    /**
     * Only templates that expose a public `/{prefix}/{slug}` route.
     */
    public function scopeRoutable(Builder $query): void
    {
        $query->where('routable', true);
    }
}
