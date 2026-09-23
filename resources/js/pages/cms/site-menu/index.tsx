import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Inbox, Navigation, PencilLine, Plus } from 'lucide-react';
import { StatusChip } from '@/pages/cms/departments';
import { home } from '@/routes';
import cmsSiteMenu from '@/routes/cms/site-menu';

type MenuItem = {
    id: number;
    label: string;
    href: string;
    sort_order: number;
    status: string;
    owner: string | null;
    reviewed_at: string | null;
};

type Props = {
    items: MenuItem[];
    canCreate: boolean;
};

export default function SiteMenuIndex({ items, canCreate }: Props) {
    return (
        <>
            <Head title="Site Menu | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                                Content Studio | Site Configuration
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Site Menu</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Manage the navigation links shown across the public site. Only approved, published
                                items appear in the header and mobile menu.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsSiteMenu.create()}
                                as="button"
                                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New menu item
                            </Link>
                        )}
                    </header>

                    {items.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <Navigation className="mt-0.5 shrink-0 text-fmca-teal" size={20} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{item.label}</h2>
                                                <StatusChip status={item.status} />
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">{item.href}</p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Position {item.sort_order}
                                                {item.owner ? ` · ${item.owner}` : ''}
                                                {item.reviewed_at ? ` · Reviewed ${item.reviewed_at}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {item.status === 'published' && (
                                            <a
                                                href={home().url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                            >
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                                <span>View live</span>
                                            </a>
                                        )}
                                        <Link
                                            href={cmsSiteMenu.edit(item.id)}
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
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No menu items yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Items you create appear here and show up in the public header once approved and published.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsSiteMenu.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Create your first menu item
                </Link>
            )}
        </div>
    );
}
