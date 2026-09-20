<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_audit_logs');
    }

    public function view(User $user, AuditLog $auditLog): bool
    {
        return $user->hasPermission('view_audit_logs');
    }

    /**
     * Audit entries are append-only; they are written by the model's
     * log() helper as part of a governed action, never created
     * directly through this policy.
     */
    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, AuditLog $auditLog): bool
    {
        return false;
    }

    public function delete(User $user, AuditLog $auditLog): bool
    {
        return false;
    }

    public function restore(User $user, AuditLog $auditLog): bool
    {
        return false;
    }

    public function forceDelete(User $user, AuditLog $auditLog): bool
    {
        return false;
    }
}
