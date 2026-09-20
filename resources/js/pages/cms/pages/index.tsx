import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Inbox, LayoutTemplate, PencilLine, Plus } from 'lucide-react';
import { StatusChip } from '@/pages/cms/departments';
import cmsPages from '@/routes/cms/pages';

type PageRow = {
    id: number;
    title: string;
    slug: string;
    status: string;
    owner: string | null;
    reviewed_at: string | null;
    template: {
        key: string | null;
        name: string | null;
        url_prefix: string | null;
        routable: boolean | null;
    };
    public_url: string | null;
};

type Props = {
    pages: PageRow[];
    canCreate: boolean;
};

export default function PagesIndex({ pages, canCreate }: Props) {
    return (
        <>
            <Head title="Pages | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Pages</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Pages</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Institutional, patient, legal and other template pages. Published pages on routable
                                templates are visible at their public URL.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsPages.create()}
                                as="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New page
                            </Link>
                        )}
                    </header>

                    {pages.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <LayoutTemplate className="mt-0.5 shrink-0 text-fmca-teal" size={20} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{page.title}</h2>
                                                <StatusChip status={page.status} />
                                                {page.template?.name && (
                                                    <span className="rounded-md bg-fmca-mist px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                        {page.template.name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                {`/${page.slug}`}
                                                {page.owner ? ` · ${page.owner}` : ''}
                                                {page.reviewed_at ? ` · Reviewed ${page.reviewed_at}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {page.public_url && (
                                            <a
                                                href={page.public_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                            >
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                                <span>View public page</span>
                                            </a>
                                        )}
                                        <Link
                                            href={cmsPages.edit(page.id)}
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

function EmptyState({ canCreate }: { canCreate: boolean }) {
    return (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
            <Inbox className="text-slate-400" size={32} aria-hidden="true" />
            <div>
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No pages yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Pages you create will appear in this list. Start by choosing a template, then add its content blocks.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsPages.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Create your first page
                </Link>
            )}
        </div>
    );
}
