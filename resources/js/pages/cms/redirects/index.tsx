import { Head, Link } from '@inertiajs/react';
import { ArrowLeftRight, PencilLine, Plus } from 'lucide-react';
import cmsRedirects from '@/routes/cms/redirects';

type RedirectRow = {
    id: number;
    from_path: string;
    to_path: string;
    status_code: number;
    is_active: boolean;
};

type Props = {
    redirects: RedirectRow[];
    canCreate: boolean;
};

export default function RedirectsIndex({ redirects, canCreate }: Props) {
    return (
        <>
            <Head title="Redirects | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Site Configuration</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">URL Redirects</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Keep retired public URLs resolving to their new location. Active redirects win over the
                                routes they point at.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsRedirects.create()}
                                as="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New redirect
                            </Link>
                        )}
                    </header>

                    {redirects.length === 0 ? (
                        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
                            <ArrowLeftRight className="text-slate-400" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No redirects yet</h2>
                                <p className="mt-1 max-w-md text-sm text-slate-600">
                                    Add a redirect whenever a public URL changes, so the old address keeps working.
                                </p>
                            </div>
                            {canCreate && (
                                <Link
                                    href={cmsRedirects.create()}
                                    as="button"
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                                >
                                    <Plus size={18} aria-hidden="true" />
                                    Create your first redirect
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {redirects.map((redirect) => (
                                <div
                                    key={redirect.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <code className="truncate text-sm font-bold text-fmca-green-dark">{redirect.from_path}</code>
                                            <span className="text-sm text-slate-400" aria-hidden="true">→</span>
                                            <code className="truncate text-sm text-slate-700">{redirect.to_path}</code>
                                            <StatusChip code={redirect.status_code} />
                                            <ActiveChip active={redirect.is_active} />
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Link
                                            href={cmsRedirects.edit(redirect.id)}
                                            as="button"
                                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <PencilLine size={15} aria-hidden="true" />
                                            <span>Edit</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function StatusChip({ code }: { code: number }) {
    return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
            {code === 302 ? 'Temporary (302)' : 'Permanent (301)'}
        </span>
    );
}

function ActiveChip({ active }: { active: boolean }) {
    if (active) {
        return (
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                Active
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
            Paused
        </span>
    );
}
