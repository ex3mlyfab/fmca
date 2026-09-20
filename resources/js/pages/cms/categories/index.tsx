import { Head, Link } from '@inertiajs/react';
import { Inbox, PencilLine, Plus, Tags } from 'lucide-react';
import cmsCategories from '@/routes/cms/categories';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
};

type Props = {
    categories: Category[];
    canCreate: boolean;
};

export default function CategoriesIndex({ categories, canCreate }: Props) {
    return (
        <>
            <Head title="News categories | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | News &amp; Press</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">News categories</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Group news, notices and press releases by topic on the public site.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsCategories.create()}
                                as="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New category
                            </Link>
                        )}
                    </header>

                    {categories.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <Tags className="mt-0.5 shrink-0 text-fmca-teal" size={20} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <h2 className="font-display text-base font-bold text-fmca-green-dark">{category.name}</h2>
                                            {category.description && (
                                                <p className="mt-1 truncate text-sm text-slate-600">{category.description}</p>
                                            )}
                                            <p className="mt-0.5 text-xs text-slate-400">/{category.slug}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={cmsCategories.edit(category.id)}
                                        as="button"
                                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                    >
                                        <PencilLine size={15} aria-hidden="true" />
                                        <span>Edit</span>
                                    </Link>
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
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No categories yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Categories you create will be available when editing news items.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsCategories.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Create your first category
                </Link>
            )}
        </div>
    );
}
