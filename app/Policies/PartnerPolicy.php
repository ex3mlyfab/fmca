<?php

namespace App\Policies;

use App\Models\Partner;
use App\Models\User;

class PartnerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_partners');
    }

    public function view(User $user, Partner $partner): bool
    {
        return $user->hasPermission('view_partners');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_partners');
    }

    public function update(User $user, Partner $partner): bool
    {
        return $user->hasPermission('edit_partners');
    }

    public function delete(User $user, Partner $partner): bool
    {
        return $user->hasPermission('edit_partners');
    }

    public function restore(User $user, Partner $partner): bool
    {
        return $user->hasPermission('edit_partners');
    }

    public function forceDelete(User $user, Partner $partner): bool
    {
        return false;
    }
}
