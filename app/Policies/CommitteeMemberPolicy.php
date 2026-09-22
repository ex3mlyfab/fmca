<?php

namespace App\Policies;

use App\Models\CommitteeMember;
use App\Models\User;

class CommitteeMemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_committees');
    }

    public function view(User $user, CommitteeMember $committeeMember): bool
    {
        return $user->hasPermission('view_committees');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_committees');
    }

    public function update(User $user, CommitteeMember $committeeMember): bool
    {
        return $user->hasPermission('edit_committees');
    }

    public function delete(User $user, CommitteeMember $committeeMember): bool
    {
        return $user->hasPermission('edit_committees');
    }

    public function restore(User $user, CommitteeMember $committeeMember): bool
    {
        return $user->hasPermission('edit_committees');
    }

    public function forceDelete(User $user, CommitteeMember $committeeMember): bool
    {
        return false;
    }
}
