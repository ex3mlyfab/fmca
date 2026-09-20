import { Form, Head, Link } from '@inertiajs/react';
import { GitCompareArrows, History, Undo2 } from 'lucide-react';
import { useState } from 'react';
import {
    restoreRevision,
} from '@/actions/App/Http/Controllers/Cms/HomepageController';
import cms from '@/routes/cms';

type Configuration = {
    id?: number;
    status?: string;
} | null;

type Revision = {
    id: number;
    revision: number;
    status: string;
    sections?: {
        hero?: { title?: string; summary?: string };
        emergency?: { message?: string; phone?: string };
        status?: { campusStatus?: string; serviceDesk?: string };
    };
    summary?: string | null;
    createdByName?: string | null;
    createdAt: string;
};

type Props = {
    configuration: Configuration;
    revisions: Revision[];
    canRestore: boolean;
};

const COMPARE_FIELDS: Array<{ key: string; label: string; value: (r: Revision) => string | undefined }> = [
    { key: 'status', label: 'Workflow status', value: (r) => r.status },
    { key: 'hero.title', label: 'Hero headline', value: (r) => r.sections?.hero?.title },
    { key: 'hero.summary', label: 'Hero summary', value: (r) => r.sections?.hero?.summary },
    { key: 'emergency.message', label: 'Emergency message', value: (r) => r.sections?.emergency?.message },
    { key: 'emergency.phone', label: 'Emergency phone', value: (r) => r.sections?.emergency?.phone },
    { key: 'status.campusStatus', label: 'Campus status', value: (r) => r.sections?.status?.campusStatus },
    { key: 'status.serviceDesk', label: 'Service desk', value: (r) => r.sections?.status?.serviceDesk },
];

export default function HomepageRevisions({ configuration, revisions, canRestore }: Props) {
    const [fromId, setFromId] = useState<string>('');
    const [toId, setToId] = useState<string>('');

    const from = revisions.find((r) => String(r.id) === fromId);
    const to = revisions.find((r) => String(r.id) === toId);
    const differences = from && to
        ? COMPARE_FIELDS.filter((field) => (field.value(from) ?? '') !== (field.value(to) ?? ''))
        : null;

    return (
        <>
            <Head title="Homepage revisions | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-4xl">
                    <header className="flex flex-col gap-4 border-b border-fmca-ink/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                                FMCA Content Studio | Editorial Governance
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">
                                Homepage revision history
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Immutable snapshots of the home configuration. Restoring a revision always lands
                                back in draft, so the content re-enters clinical review before it can be republished.
                            </p>
                        </div>
                        <Link
                            href={cms.homepage.edit()}
                            as="button"
                            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-fmca-ink/15 bg-white px-4 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                        >
                            <History size={16} aria-hidden="true" />
                            <span>Back to editor</span>
                        </Link>
                    </header>

                    {revisions.length === 0 ? (
                        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
                            <GitCompareArrows className="text-slate-400" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No revisions yet</h2>
                                <p className="mt-1 max-w-md text-sm text-slate-600">
                                    Revisions appear as soon as the home configuration is saved, reviewed,
                                    published or restored.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <section className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                                <div className="border-b border-fmca-ink/10 px-5 py-4">
                                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">Snapshots</h2>
                                </div>
                                {revisions.map((revision) => (
                                    <div
                                        key={revision.id}
                                        className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-bold text-fmca-green-dark">Revision {revision.revision}</span>
                                                <StatusChip status={revision.status} />
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                {revision.summary ?? '—'}
                                                {revision.createdByName ? ` · ${revision.createdByName}` : ''} · {revision.createdAt}
                                            </p>
                                        </div>
                                        {canRestore && (
                                            <Form
                                                href={restoreRevision.url(revision.id)}
                                                method="post"
                                                as="div"
                                                className="shrink-0"
                                            >
                                                <button
                                                    type="submit"
                                                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                                >
                                                    <Undo2 size={15} aria-hidden="true" />
                                                    <span>Restore</span>
                                                </button>
                                            </Form>
                                        )}
                                    </div>
                                ))}
                            </section>

                            <section className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                                <div className="border-b border-fmca-ink/10 px-5 py-4">
                                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">Compare revisions</h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Pick two snapshots to see exactly what changed between them.
                                    </p>
                                </div>
                                <div className="grid gap-4 p-5 sm:grid-cols-2">
                                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
                                        From
                                        <select
                                            value={fromId}
                                            onChange={(e) => setFromId(e.target.value)}
                                            className="h-11 rounded-md border border-input bg-transparent px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <option value="">Select a revision…</option>
                                            {revisions.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    #{r.revision} · {r.status} · {r.createdAt}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
                                        To
                                        <select
                                            value={toId}
                                            onChange={(e) => setToId(e.target.value)}
                                            className="h-11 rounded-md border border-input bg-transparent px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <option value="">Select a revision…</option>
                                            {revisions.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    #{r.revision} · {r.status} · {r.createdAt}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                {from && to && differences && (
                                    <div className="border-t border-fmca-ink/10 p-5">
                                        {differences.length === 0 ? (
                                            <p className="text-sm font-medium text-slate-500">
                                                No field differences between revision {from.revision} and revision {to.revision}.
                                            </p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[480px] text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-fmca-ink/10 text-xs font-bold uppercase tracking-wide text-slate-500">
                                                            <th className="py-2 pr-4">Field</th>
                                                            <th className="py-2 pr-4">#{from.revision}</th>
                                                            <th className="py-2">#{to.revision}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {differences.map((field) => (
                                                            <tr key={field.key} className="border-b border-fmca-ink/10 last:border-0">
                                                                <td className="py-2.5 pr-4 font-bold text-slate-700">{field.label}</td>
                                                                <td className="py-2.5 pr-4 text-slate-600">
                                                {(field.value(from) ?? '') || <span className="text-slate-400">—</span>}
                                                                </td>
                                                                <td className="py-2.5 text-slate-900">
                                                {(field.value(to) ?? '') || <span className="text-slate-400">—</span>}
                                            </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function StatusChip({ status }: { status: string }) {
    const palette: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-700',
        in_review: 'bg-amber-50 text-amber-700',
        changes_requested: 'bg-rose-50 text-rose-700',
        approved: 'bg-sky-50 text-sky-700',
        published: 'bg-emerald-50 text-emerald-700',
        archived: 'bg-slate-100 text-slate-500',
    };

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${palette[status] ?? 'bg-slate-100 text-slate-700'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
