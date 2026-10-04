<?php

namespace App\Policies;

use App\Models\InstituteProfile;
use App\Models\User;

class InstituteProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_institute_profile');
    }

    public function view(User $user, InstituteProfile $instituteProfile): bool
    {
        return $user->hasPermission('view_institute_profile');
    }

    public function update(User $user, InstituteProfile $instituteProfile): bool
    {
        return $user->hasPermission('edit_institute_profile');
    }

    /**
     * Only communications staff may promote the profile to published. The
     * profile also carries the emergency line shown site-wide.
     */
    public function publish(User $user): bool
    {
        return $user->hasPermission('publish_institute_profile');
    }

    public function delete(User $user, InstituteProfile $instituteProfile): bool
    {
        return false;
    }

    public function restore(User $user, InstituteProfile $instituteProfile): bool
    {
        return false;
    }

    public function forceDelete(User $user, InstituteProfile $instituteProfile): bool
    {
        return false;
    }
}
