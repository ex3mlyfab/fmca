<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'guard_name', 'description', 'created_by'];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    /**
     * Check if this role has the given permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('permissions.name', $permission)->exists();
    }

    /**
     * Sync permissions for this role.
     */
    public function syncPermissions(array $permissions): void
    {
        $this->permissions()->sync(
            Permission::whereIn('name', $permissions)->pluck('id')->all()
        );
    }

    /**
     * Scope by guard name.
     */
    public function scopeByGuardName(Builder $query, string $guardName): void
    {
        $query->where('guard_name', $guardName);
    }
}
