import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { news } from '@/routes';
import newsRoutes from '@/routes/news';

export type RecentNewsItem = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    featureImage?: string | null;
    featureImageAlt?: string | null;
    publishDate?: string | null;
    category?: { name: string; slug: string } | null;
};

export type RecentNewsProps = {
    news?: RecentNewsItem[];
    heading?: string;
    subheading?: string;
};

/**
 * A surface for the latest published news on the home page. Every item is
 * reviewed by the FMCA communications team before publication.
 */
export function RecentNews({
    news: posts = [],
    heading = 'News & updates',
    subheading = 'The latest announcements, press releases and public notices from the FMCA communications team.',
}: RecentNewsProps) {
    return (
        <section id="news" className="bg-fmca-mist py-14 sm:py-16 lg:py-20" aria-labelledby="news-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">News &amp; public notices</p>
                        <h2 id="news-heading" className="mt-2 font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl lg:text-4xl">
                            {heading}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{subheading}</p>
                    </div>
                    <a
                        href={news().url}
                        className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-bold text-fmca-green transition-colors hover:text-fmca-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                    >
                        <span>View all news</span>
                        <ArrowRight size={16} aria-hidden="true" />
                    </a>
                </div>

                {posts.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-fmca-ink/10 bg-white p-10 text-center shadow-xs">
                        <Newspaper className="text-fmca-teal" size={28} aria-hidden="true" />
                        <p className="max-w-md text-sm text-slate-600">
                            New items will appear here once the FMCA communications team has approved them for publication.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <a
                                key={post.id}
                                href={newsRoutes.show.url(post.slug)}
                                className="group flex flex-col overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs transition-all hover:-translate-y-1 hover:border-fmca-green/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                            >
                                {post.featureImage ? (
                                    <img
                                        src={post.featureImage}
                                        alt={post.featureImageAlt ?? ''}
                                        loading="lazy"
                                        className="aspect-[16/9] w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-[16/9] w-full items-center justify-center bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12)_0%,transparent_60%)] bg-fmca-mist text-fmca-teal">
                                        <Newspaper size={28} aria-hidden="true" />
                                    </div>
                                )}
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        {post.category && (
                                            <Badge variant="outline" className="border-fmca-green/30 text-fmca-green">
                                                {post.category.name}
                                            </Badge>
                                        )}
                                        {post.publishDate && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums text-slate-500">
                                                <CalendarDays size={14} aria-hidden="true" />
                                                {post.publishDate}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-3 font-display text-lg font-bold text-fmca-green-dark transition-colors group-hover:text-fmca-green">
                                        {post.title}
                                    </h3>
                                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                                        {post.summary}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                        <span>Read more</span>
                                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
