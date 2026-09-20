<?php

namespace App\Policies;

use App\Models\Campaign;
use App\Models\User;

class CampaignPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_campaigns');
    }

    public function view(User $user, Campaign $campaign): bool
    {
        return $user->hasPermission('view_campaigns');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_campaigns');
    }

    public function update(User $user, Campaign $campaign): bool
    {
        return $user->hasPermission('edit_campaigns');
    }

    public function delete(User $user, Campaign $campaign): bool
    {
        return $user->hasPermission('edit_campaigns');
    }

    public function restore(User $user, Campaign $campaign): bool
    {
        return $user->hasPermission('edit_campaigns');
    }

    public function forceDelete(User $user, Campaign $campaign): bool
    {
        return false;
    }
}
