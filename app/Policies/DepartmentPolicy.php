<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;

class DepartmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_departments');
    }

    public function view(User $user, Department $department): bool
    {
        return $user->hasPermission('view_departments');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_departments');
    }

    public function update(User $user, Department $department): bool
    {
        return $user->hasPermission('edit_departments');
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->hasPermission('edit_departments');
    }

    public function restore(User $user, Department $department): bool
    {
        return $user->hasPermission('edit_departments');
    }

    public function forceDelete(User $user, Department $department): bool
    {
        return false;
    }
}
