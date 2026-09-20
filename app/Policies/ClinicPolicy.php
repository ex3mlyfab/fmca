<?php

namespace App\Policies;

use App\Models\Clinic;
use App\Models\User;

class ClinicPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_clinics');
    }

    public function view(User $user, Clinic $clinic): bool
    {
        return $user->hasPermission('view_clinics');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_clinics');
    }

    public function update(User $user, Clinic $clinic): bool
    {
        return $user->hasPermission('edit_clinics');
    }

    public function delete(User $user, Clinic $clinic): bool
    {
        return $user->hasPermission('edit_clinics');
    }

    public function restore(User $user, Clinic $clinic): bool
    {
        return $user->hasPermission('edit_clinics');
    }

    public function forceDelete(User $user, Clinic $clinic): bool
    {
        return false;
    }
}
