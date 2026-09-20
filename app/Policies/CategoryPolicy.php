<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_news');
    }

    public function view(User $user, Category $category): bool
    {
        return $user->hasPermission('view_news');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function restore(User $user, Category $category): bool
    {
        return $user->hasPermission('edit_news');
    }

    public function forceDelete(User $user, Category $category): bool
    {
        return false;
    }
}
