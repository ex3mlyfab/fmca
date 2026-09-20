<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_documents');
    }

    public function view(User $user, Document $document): bool
    {
        return $user->hasPermission('view_documents');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('edit_documents');
    }

    public function update(User $user, Document $document): bool
    {
        return $user->hasPermission('edit_documents');
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->hasPermission('edit_documents');
    }

    public function restore(User $user, Document $document): bool
    {
        return $user->hasPermission('edit_documents');
    }

    public function forceDelete(User $user, Document $document): bool
    {
        return false;
    }
}
