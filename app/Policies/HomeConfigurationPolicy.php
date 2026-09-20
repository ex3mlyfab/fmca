<?php

namespace App\Policies;

use App\Models\HomeConfiguration;
use App\Models\User;

class HomeConfigurationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_homepage');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, HomeConfiguration $homeConfiguration): bool
    {
        return $user->hasPermission('view_homepage');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermission('edit_homepage');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, HomeConfiguration $homeConfiguration): bool
    {
        return $user->hasPermission('edit_homepage');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, HomeConfiguration $homeConfiguration): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, HomeConfiguration $homeConfiguration): bool
    {
        return $user->hasPermission('manage_roles');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, HomeConfiguration $homeConfiguration): bool
    {
        return false;
    }
}
