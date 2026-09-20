<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'guard_name'];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role');
    }

    /**
     * Users who hold this permission through the role assigned to them.
     *
     * A user is linked to a single role via the users.role_id foreign key
     * (see User::role()); that role grants a set of permissions.
     *
     * @return Builder<User>
     */
    public function users(): Builder
    {
        return User::whereHas(
            'role.permissions',
            fn (Builder $query): Builder => $query->whereKey($this->id),
        );
    }

    /**
     * Scope a query to only include permissions with the given name.
     */
    public function scopeByName(Builder $query, string $name): void
    {
        $query->where('name', $name);
    }
}
