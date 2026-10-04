<?php

namespace App\Policies;

use App\Models\BrandAsset;
use App\Models\User;

class BrandAssetPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_brand_identity');
    }

    public function view(User $user, BrandAsset $brandAsset): bool
    {
        return $user->hasPermission('view_brand_identity');
    }

    public function update(User $user, BrandAsset $brandAsset): bool
    {
        return $user->hasPermission('edit_brand_identity');
    }

    /**
     * Only communications staff may promote a slot to published.
     */
    public function publish(User $user): bool
    {
        return $user->hasPermission('publish_brand_identity');
    }

    public function delete(User $user, BrandAsset $brandAsset): bool
    {
        return $user->hasPermission('edit_brand_identity');
    }

    public function restore(User $user, BrandAsset $brandAsset): bool
    {
        return $user->hasPermission('edit_brand_identity');
    }

    public function forceDelete(User $user, BrandAsset $brandAsset): bool
    {
        return false;
    }
}
