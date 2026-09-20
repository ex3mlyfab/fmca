<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;

class MediaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_media');
    }

    public function view(User $user, Media $media): bool
    {
        return $user->hasPermission('view_media');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('upload_media');
    }

    public function update(User $user, Media $media): bool
    {
        return $user->hasPermission('upload_media');
    }

    public function delete(User $user, Media $media): bool
    {
        return $user->hasPermission('delete_media');
    }

    public function restore(User $user, Media $media): bool
    {
        return $user->hasPermission('delete_media');
    }

    public function forceDelete(User $user, Media $media): bool
    {
        return false;
    }
}
