<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_news');
    }

    public function view(User $user, Post $post): bool
    {
        return $user->hasPermission('view_news');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function update(User $user, Post $post): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function delete(User $user, Post $post): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function restore(User $user, Post $post): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function forceDelete(User $user, Post $post): bool
    {
        return false;
    }
}
