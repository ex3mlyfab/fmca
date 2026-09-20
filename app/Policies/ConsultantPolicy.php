<?php

namespace App\Policies;

use App\Models\Consultant;
use App\Models\User;

class ConsultantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_consultants');
    }

    public function view(User $user, Consultant $consultant): bool
    {
        return $user->hasPermission('view_consultants');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_consultants');
    }

    public function update(User $user, Consultant $consultant): bool
    {
        return $user->hasPermission('edit_consultants');
    }

    public function delete(User $user, Consultant $consultant): bool
    {
        return $user->hasPermission('edit_consultants');
    }

    public function restore(User $user, Consultant $consultant): bool
    {
        return $user->hasPermission('edit_consultants');
    }

    public function forceDelete(User $user, Consultant $consultant): bool
    {
        return false;
    }
}
