<?php

namespace App\Policies;

use App\Models\SiteMenuItem;
use App\Models\User;

class SiteMenuItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_site_menu');
    }

    public function view(User $user, SiteMenuItem $siteMenuItem): bool
    {
        return $user->hasPermission('view_site_menu');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_site_menu');
    }

    public function update(User $user, SiteMenuItem $siteMenuItem): bool
    {
        return $user->hasPermission('edit_site_menu');
    }

    public function delete(User $user, SiteMenuItem $siteMenuItem): bool
    {
        return $user->hasPermission('edit_site_menu');
    }

    public function restore(User $user, SiteMenuItem $siteMenuItem): bool
    {
        return $user->hasPermission('edit_site_menu');
    }

    public function forceDelete(User $user, SiteMenuItem $siteMenuItem): bool
    {
        return false;
    }
}
