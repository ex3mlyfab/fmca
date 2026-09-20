import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock3, Home, PenLine } from 'lucide-react';
import { PageBlockView, type PageBlockData } from '@/components/public/page-blocks';
import { SiteShell } from '@/components/public/site-shell';
import { home } from '@/routes';

type PageTemplate = {
    key: string;
    name: string;
    url_prefix: string | null;
};

type PageData = {
    slug: string;
    title: string;
    summary: string | null;
    owner: string | null;
    reviewed_at: string | null;
    template: PageTemplate;
    blocks: PageBlockData[];
};

type Props = {
    page: PageData;
};

export default function Page({ page }: Props) {
    const orderedBlocks = [...page.blocks].sort((a, b) => a.sort_order - b.sort_order);
    const hasReviewMeta = Boolean(page.owner || page.reviewed_at);

    return (
        <SiteShell>
            <Head title={`${page.title} | Federal Medical Centre, Abuja`} />
            <main id="main-content">
                {/* Breadcrumb + identity */}
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                        <nav aria-label="Breadcrumb" className="mb-5">
                            <Link
                                href={home().url}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-fmca-green hover:text-fmca-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                            >
                                <Home size={16} aria-hidden="true" />
                                Home
                            </Link>
                        </nav>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">{page.template.name}</p>
                        <h1 className="mt-3 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">{page.title}</h1>
                        {page.summary && (
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">{page.summary}</p>
                        )}
                        {hasReviewMeta && (
                            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600 sm:text-sm">
                                {page.owner && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <PenLine size={16} className="text-fmca-teal" aria-hidden="true" />
                                        {page.owner}
                                    </span>
                                )}
                                {page.reviewed_at && (
                                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                                        <Clock3 size={16} className="text-fmca-teal" aria-hidden="true" />
                                        Last reviewed {page.reviewed_at}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-8">
                            {orderedBlocks.length === 0 ? (
                                <p className="text-sm leading-relaxed text-slate-600">
                                    This page has no content blocks yet. The content team will add details soon.
                                </p>
                            ) : (
                                orderedBlocks.map((block, index) => (
                                    <PageBlockView key={`${block.block_key}-${index}`} block={block} />
                                ))
                            )}
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-5">
                                <div className="flex items-center gap-2 text-sm font-bold text-fmca-green-dark">
                                    <Clock3 size={18} className="text-fmca-teal" aria-hidden="true" />
                                    <span>Content reviewed</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                    {page.owner ? `Content owner ${page.owner}` : 'Owned by the FMCA communications team.'}
                                </p>
                                <div className="mt-4 flex items-center gap-2 border-t border-fmca-ink/10 pt-4 text-sm text-slate-600">
                                    <CheckCircle2 size={16} className="text-fmca-green" aria-hidden="true" />
                                    <span>
                                        {page.reviewed_at ? `Last reviewed ${page.reviewed_at}` : 'Reviewed by the FMCA communications team.'}
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>
        </SiteShell>
    );
}
