import { Head } from '@inertiajs/react';
import { Search, Stethoscope, Building2, Newspaper, BookOpen } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { search } from '@/routes';
import serviceRoutes from '@/routes/services';
import departmentRoutes from '@/routes/departments';
import newsRoutes from '@/routes/news';

type ServiceHit = { id: number; name: string; slug: string; summary: string | null };
type DepartmentHit = { id: number; name: string; slug: string; summary: string | null };
type NewsHit = { id: number; title: string; slug: string; summary: string | null };
type PageHit = {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    template: { name: string; url_prefix: string };
};

type Results = {
    services: ServiceHit[];
    departments: DepartmentHit[];
    news: NewsHit[];
    pages: PageHit[];
};

type Props = {
    query: string;
    total: number;
    results: Results;
};

function ResultRow({ title, summary, href }: { title: string; summary: string | null; href: string }) {
    return (
        <li>
            <a
                href={href}
                className="group flex flex-col gap-1 p-5 transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
            >
                <span className="font-display text-base font-bold text-fmca-green-dark group-hover:text-fmca-green">{title}</span>
                {summary && <span className="max-w-2xl text-sm leading-relaxed text-slate-600">{summary}</span>}
            </a>
        </li>
    );
}

export default function SearchPage({ query, total, results }: Props) {
    const groups: Array<{ key: keyof Results; label: string; icon: React.ReactNode; empty: string }> = [
        { key: 'services', label: 'Services', icon: <Stethoscope size={16} aria-hidden="true" />, empty: 'No matching services.' },
        { key: 'departments', label: 'Departments', icon: <Building2 size={16} aria-hidden="true" />, empty: 'No matching departments.' },
        { key: 'news', label: 'News & updates', icon: <Newspaper size={16} aria-hidden="true" />, empty: 'No matching news.' },
        { key: 'pages', label: 'Guides & statements', icon: <BookOpen size={16} aria-hidden="true" />, empty: 'No matching guides or statements.' },
    ];

    return (
        <SiteShell>
            <Head title="Search | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Site search</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">Search FMCA</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            Find published services, departments, news and patient guidance in one place.
                        </p>
                        <form action={search().url} method="get" className="mt-6 flex max-w-xl gap-3">
                            <label className="sr-only" htmlFor="search-query">
                                Search the FMCA website
                            </label>
                            <Input
                                id="search-query"
                                name="q"
                                defaultValue={query}
                                type="search"
                                placeholder="Try “cardiology”, “visiting” or “privacy”…"
                                className="h-12 rounded-md"
                            />
                            <Button type="submit" className="h-12 bg-fmca-green px-5 hover:bg-fmca-green-dark">
                                <Search size={16} className="mr-2" aria-hidden="true" /> Search
                            </Button>
                        </form>
                    </div>
                </section>

                {query === '' ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <Search className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">Search FMCA content</h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    Type a keyword above to search published services, departments, news and patient
                                    guidance.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : total === 0 ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <Search className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">
                                    No results for “{query}”
                                </h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    Try a different keyword, or browse the{' '}
                                    <a href="/services" className="font-semibold text-fmca-green underline underline-offset-2">
                                        services directory
                                    </a>{' '}
                                    instead.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                        <p className="text-sm font-semibold text-slate-500">
                            {total} result{total === 1 ? '' : 's'} for “{query}”
                        </p>
                        <div className="mt-5 grid gap-8 lg:grid-cols-2">
                            {groups.map((group) => (
                                <div key={group.key}>
                                    <div className="flex items-center gap-2">
                                        {group.icon}
                                        <h2 className="font-display text-base font-bold text-fmca-green-dark">{group.label}</h2>
                                        {results[group.key].length > 0 && (
                                            <Badge variant="outline" className="border-fmca-green/30 text-fmca-green">
                                                {results[group.key].length}
                                            </Badge>
                                        )}
                                    </div>
                                    {results[group.key].length === 0 ? (
                                        <p className="mt-3 text-sm text-slate-500">{group.empty}</p>
                                    ) : (
                                        <ol className="mt-3 divide-y divide-fmca-ink/10 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                                            {group.key === 'services' &&
                                                results.services.map((service) => (
                                                    <ResultRow
                                                        key={service.id}
                                                        title={service.name}
                                                        summary={service.summary}
                                                        href={serviceRoutes.show.url(service.slug)}
                                                    />
                                                ))}
                                            {group.key === 'departments' &&
                                                results.departments.map((department) => (
                                                    <ResultRow
                                                        key={department.id}
                                                        title={department.name}
                                                        summary={department.summary}
                                                        href={departmentRoutes.show.url(department.slug)}
                                                    />
                                                ))}
                                            {group.key === 'news' &&
                                                results.news.map((post) => (
                                                    <ResultRow
                                                        key={post.id}
                                                        title={post.title}
                                                        summary={post.summary}
                                                        href={newsRoutes.show.url(post.slug)}
                                                    />
                                                ))}
                                            {group.key === 'pages' &&
                                                results.pages.map((page) => (
                                                    <ResultRow
                                                        key={page.id}
                                                        title={page.title}
                                                        summary={page.summary}
                                                        href={`/${page.template.url_prefix}/${page.slug}`}
                                                    />
                                                ))}
                                        </ol>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </SiteShell>
    );
}
