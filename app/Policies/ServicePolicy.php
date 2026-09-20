<?php

namespace App\Policies;

use App\Models\Service;
use App\Models\User;

class ServicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_services');
    }

    public function view(User $user, Service $service): bool
    {
        return $user->hasPermission('view_services');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_services');
    }

    public function update(User $user, Service $service): bool
    {
        return $user->hasPermission('edit_services');
    }

    public function delete(User $user, Service $service): bool
    {
        return $user->hasPermission('edit_services');
    }

    public function restore(User $user, Service $service): bool
    {
        return $user->hasPermission('edit_services');
    }

    public function forceDelete(User $user, Service $service): bool
    {
        return false;
    }
}
