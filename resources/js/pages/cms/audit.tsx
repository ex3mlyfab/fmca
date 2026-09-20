import { Head } from '@inertiajs/react';
import { ScrollText, ShieldCheck } from 'lucide-react';

type LogEntry = {
    id: number;
    action: string;
    contentType: string | null;
    contentId: number | null;
    summary: string | null;
    actorName: string;
    ipAddress: string | null;
    createdAt: string;
};

type Props = {
    logs: LogEntry[];
};

const ACTION_STYLES: Record<string, { label: string; className: string }> = {
    created: { label: 'Created', className: 'bg-sky-50 text-sky-700' },
    updated: { label: 'Updated', className: 'bg-slate-100 text-slate-700' },
    submitted_for_review: { label: 'Submitted for review', className: 'bg-amber-50 text-amber-700' },
    changes_requested: { label: 'Changes requested', className: 'bg-rose-50 text-rose-700' },
    approved: { label: 'Approved', className: 'bg-sky-50 text-sky-700' },
    published: { label: 'Published', className: 'bg-emerald-50 text-emerald-700' },
    archived: { label: 'Archived', className: 'bg-slate-100 text-slate-500' },
    restored: { label: 'Restored', className: 'bg-violet-50 text-violet-700' },
    deleted: { label: 'Deleted', className: 'bg-rose-50 text-rose-700' },
    deleted_attempted: { label: 'Deletion attempted', className: 'bg-rose-50 text-rose-700' },
};

export default function AuditLogIndex({ logs }: Props) {
    return (
        <>
            <Head title="Audit Log | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-4xl">
                    <header className="flex flex-col gap-4 border-b border-fmca-ink/10 pb-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                                FMCA Content Studio | Editorial Governance
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Audit log</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                The most recent 100 governance events. Audit entries are append-only and can
                                never be edited or deleted.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-fmca-green">
                            <ShieldCheck size={16} aria-hidden="true" />
                            Immutable change log
                        </span>
                    </header>

                    {logs.length === 0 ? (
                        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
                            <ScrollText className="text-slate-400" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No events recorded yet</h2>
                                <p className="mt-1 max-w-md text-sm text-slate-600">
                                    Governance events — saves, reviews, approvals, publications, restores and
                                    deletion attempts — will appear here as they happen.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {logs.map((log) => {
                                const action = ACTION_STYLES[log.action] ?? { label: log.action, className: 'bg-slate-100 text-slate-700' };
                                return (
                                    <div
                                        key={log.id}
                                        className="flex flex-col gap-2 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-start sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${action.className}`}>
                                                    {action.label}
                                                </span>
                                                {log.contentType && (
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {log.contentType}
                                                        {log.contentId ? ` #${log.contentId}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                            {log.summary && <p className="mt-1.5 text-sm text-slate-700">{log.summary}</p>}
                                        </div>
                                        <div className="shrink-0 text-right text-xs text-slate-500">
                                            <p className="font-bold text-slate-700">{log.actorName}</p>
                                            <p>{log.createdAt}</p>
                                            {log.ipAddress && <p className="mt-0.5 font-mono text-[11px] text-slate-400">{log.ipAddress}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
