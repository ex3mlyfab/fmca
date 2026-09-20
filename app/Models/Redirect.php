<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_path', 'to_path', 'status_code', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'status_code' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Only redirects that should actually take effect.
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Find the active redirect for a request path, if one is configured.
     *
     * @return array{redirect: Redirect, status: int}|null
     */
    public static function findFor(string $path): ?array
    {
        $redirect = static::query()
            ->active()
            ->where('from_path', $path)
            ->first();

        if ($redirect === null) {
            return null;
        }

        return ['redirect' => $redirect, 'status' => $redirect->status_code];
    }
}
