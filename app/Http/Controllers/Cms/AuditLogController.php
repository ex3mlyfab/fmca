<?php

namespace App\Http\Controllers\Cms;

use App\Models\AuditLog;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController
{
    /**
     * Read-only governance log. Newest entries first; append-only.
     */
    public function index(): Response
    {
        $logs = AuditLog::recent(100);

        return Inertia::render('cms/audit', [
            'logs' => $logs
                ->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'contentType' => $log->content_type,
                    'contentId' => $log->content_id,
                    'summary' => $log->summary,
                    'actorName' => $log->actor?->name ?? 'System',
                    'ipAddress' => $log->ip_address,
                    'createdAt' => $log->created_at->toDateTimeString(),
                ])
                ->values(),
        ]);
    }
}
