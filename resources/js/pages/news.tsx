import { Head } from '@inertiajs/react';
import { ArrowRight, Newspaper } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { Badge } from '@/components/ui/badge';
import { news } from '@/routes';
import newsRoutes from '@/routes/news';

type PostSummary = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    author: string;
    publishDate: string | null;
    category: { name: string; slug: string } | null;
};

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Props = {
    posts: PostSummary[];
    categories: Category[];
    activeCategory: string | null;
};

export default function News({ posts, categories, activeCategory }: Props) {
    return (
        <SiteShell>
            <Head title="News & Updates | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">News & public notices</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">News &amp; updates</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            Published announcements, press releases and public notices from FMCA. Every item is reviewed
                            by the FMCA communications team before it is published.
                        </p>
                    </div>
                </section>

                {categories.length > 0 && (
                    <nav aria-label="News categories" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
                        <ul className="flex flex-wrap gap-2">
                            <li>
                                <a
                                    href={news().url}
                                    className={`inline-flex min-h-12 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky ${activeCategory
                                        ? 'border border-fmca-ink/15 bg-white text-slate-600 hover:bg-fmca-mist hover:text-fmca-green'
                                        : 'bg-fmca-green text-white hover:bg-fmca-green-dark'}`}
                                    aria-pressed={Boolean(activeCategory)}
                                >
                                    All news
                                </a>
                            </li>
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <a
                                        href={news({ query: { category: category.slug } }).url}
                                        className={`inline-flex min-h-12 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky ${activeCategory === category.slug
                                            ? 'bg-fmca-green text-white hover:bg-fmca-green-dark'
                                            : 'border border-fmca-ink/15 bg-white text-slate-600 hover:bg-fmca-mist hover:text-fmca-green'}`}
                                        aria-pressed={activeCategory === category.slug}
                                    >
                                        {category.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {posts.length === 0 ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <Newspaper className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">
                                    {activeCategory ? 'No news in this category yet' : 'No news published yet'}
                                </h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    News and public notices will appear here once the FMCA communications team has
                                    approved them for publication.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                        <ol className="divide-y divide-fmca-ink/10 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {posts.map((post) => (
                                <li key={post.id}>
                                    <a
                                        href={newsRoutes.show.url(post.slug)}
                                        className="group flex flex-col gap-3 p-6 transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-fmca-sky sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-8"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                {post.category && (
                                                    <Badge variant="outline" className="border-fmca-green/30 text-fmca-green">
                                                        {post.category.name}
                                                    </Badge>
                                                )}
                                                {post.publishDate && (
                                                    <span className="text-xs font-semibold tabular-nums text-slate-500">
                                                        {post.publishDate}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="mt-2 font-display text-lg font-bold text-fmca-green-dark group-hover:text-fmca-green">
                                                {post.title}
                                            </h2>
                                            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                                                {post.summary}
                                            </p>
                                        </div>
                                        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-fmca-green">
                                            <span>Read more</span>
                                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
            </main>
        </SiteShell>
    );
}
