<?php

namespace App\Policies;

use App\Models\Redirect;
use App\Models\User;

class RedirectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_redirects');
    }

    public function view(User $user, Redirect $redirect): bool
    {
        return $user->hasPermission('view_redirects');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_redirects');
    }

    public function update(User $user, Redirect $redirect): bool
    {
        return $user->hasPermission('edit_redirects');
    }

    public function delete(User $user, Redirect $redirect): bool
    {
        return $user->hasPermission('edit_redirects');
    }

    public function restore(User $user, Redirect $redirect): bool
    {
        return $user->hasPermission('edit_redirects');
    }

    public function forceDelete(User $user, Redirect $redirect): bool
    {
        return false;
    }
}
