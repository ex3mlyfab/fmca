import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Newspaper, PenLine } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { Badge } from '@/components/ui/badge';
import { news } from '@/routes';
import newsRoutes from '@/routes/news';

type Post = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    body: string;
    author: string;
    publishDate: string | null;
    owner: string | null;
    reviewedAt: string | null;
    category: { name: string; slug: string } | null;
};

type RelatedPost = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    publishDate: string | null;
};

type Props = {
    post: Post;
    related: RelatedPost[];
};

export default function Article({ post, related }: Props) {
    return (
        <SiteShell>
            <Head title={`${post.title} | Federal Medical Centre, Abuja`} />
            <main id="main-content">
                {/* Breadcrumb + identity */}
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                        <nav aria-label="Breadcrumb" className="mb-5">
                            <Link
                                href={news().url}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-fmca-green hover:text-fmca-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                            >
                                <Newspaper size={16} aria-hidden="true" />
                                All news
                            </Link>
                        </nav>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                {post.category && (
                                    <a
                                        href={news({ query: { category: post.category.slug } }).url}
                                        className="inline-block"
                                    >
                                        <Badge variant="outline" className="border-fmca-green/30 text-fmca-green hover:border-fmca-green/60">
                                            {post.category.name}
                                        </Badge>
                                    </a>
                                )}
                                <h1 className="mt-3 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">{post.title}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">{post.summary}</p>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600 sm:text-sm">
                            <span className="inline-flex items-center gap-1.5">
                                <PenLine size={16} className="text-fmca-teal" aria-hidden="true" />
                                {post.author}
                            </span>
                            {post.publishDate && (
                                <span className="inline-flex items-center gap-1.5 tabular-nums">
                                    <CalendarDays size={16} className="text-fmca-teal" aria-hidden="true" />
                                    {post.publishDate}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                        <div>
                            <p className="max-w-[65ch] whitespace-pre-line text-base leading-relaxed text-slate-700">
                                {post.body}
                            </p>
                        </div>

                        <aside className="space-y-4">
                            {related.length > 0 && (
                                <div className="rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs">
                                    <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                                        More news
                                    </h2>
                                    <ul className="mt-3 space-y-1">
                                        {related.map((item) => (
                                            <li key={item.id}>
                                                <a
                                                    href={newsRoutes.show.url(item.slug)}
                                                    className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-fmca-mist hover:text-fmca-green focus-visible:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                                >
                                                    <span className="line-clamp-1">{item.title}</span>
                                                    <ArrowRight size={15} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-fmca-green" aria-hidden="true" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-5">
                                <div className="flex items-center gap-2 text-sm font-bold text-fmca-green-dark">
                                    <Clock3 size={18} className="text-fmca-teal" aria-hidden="true" />
                                    <span>Content reviewed</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                    {post.owner ? `Content owner ${post.owner}` : 'Owned by the FMCA communications team.'}
                                </p>
                                <div className="mt-4 flex items-center gap-2 border-t border-fmca-ink/10 pt-4 text-sm text-slate-600">
                                    <CheckCircle2 size={16} className="text-fmca-green" aria-hidden="true" />
                                    <span>
                                        {post.reviewedAt ? `Last reviewed ${post.reviewedAt}` : 'Reviewed by the FMCA communications team.'}
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
