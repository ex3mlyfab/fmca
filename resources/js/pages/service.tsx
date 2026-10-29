import { Head } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock3, Info, Stethoscope } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { SiteShell } from '@/components/public/site-shell';
import { RichBody } from '@/components/public/rich-body';
import { Badge } from '@/components/ui/badge';
import { services } from '@/routes';
import serviceRoutes from '@/routes/services';
import departmentRoutes from '@/routes/departments';

type Service = {
    id: number;
    name: string;
    slug: string;
    summary: string;
    description: string;
    referralGuidance: string | null;
    eligibility: string | null;
    owner: string | null;
    reviewedAt: string | null;
    department: { name: string; slug: string } | null;
};

type RelatedService = {
    id: number;
    name: string;
    slug: string;
    summary: string;
};

type Props = {
    service: Service;
    related: RelatedService[];
};

export default function Service({ service, related }: Props) {
    return (
        <SiteShell>
            <Head title={`${service.name} | Federal Medical Centre, Abuja`} />
            <main id="main-content">
                {/* Breadcrumb + identity */}
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                        <nav aria-label="Breadcrumb" className="mb-5">
                            <Link
                                href={services.url()}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-fmca-green hover:text-fmca-green-dark"
                            >
                                <Stethoscope size={16} aria-hidden="true" />
                                All services
                            </Link>
                        </nav>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">{service.name}</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">{service.summary}</p>
                            </div>
                            {service.department && (
                                <Link
                                    href={departmentRoutes.show.url(service.department.slug)}
                                    className="inline-flex min-h-12 items-center gap-2 rounded-md border border-fmca-green bg-white px-4 text-sm font-bold text-fmca-green shadow-xs hover:bg-fmca-mist"
                                >
                                    <span>View {service.department.name}</span>
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">About this service</h2>
                                <RichBody body={service.description} className="mt-3 max-w-[65ch]" />
                            </div>

                            {service.referralGuidance && (
                                <div className="rounded-xl border border-fmca-teal/30 bg-white p-5 shadow-xs">
                                    <h2 className="flex items-center gap-2 font-display text-base font-bold text-fmca-green-dark">
                                        <Info size={18} className="text-fmca-teal" aria-hidden="true" />
                                        Referral guidance
                                    </h2>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{service.referralGuidance}</p>
                                </div>
                            )}

                            {service.eligibility && (
                                <div className="rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs">
                                    <h2 className="font-display text-base font-bold text-fmca-green-dark">Eligibility</h2>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{service.eligibility}</p>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-4">
                            {related.length > 0 && (
                                <div className="rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs">
                                    <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                                        More in {service.department?.name ?? 'this area'}
                                    </h2>
                                    <ul className="mt-3 space-y-1">
                                        {related.map((item) => (
                                            <li key={item.id}>
                                                <a
                                                    href={serviceRoutes.show.url(item.slug)}
                                                    className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-fmca-mist hover:text-fmca-green focus-visible:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                                >
                                                    <span className="line-clamp-1">{item.name}</span>
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
                                    {service.reviewedAt ? `Last reviewed ${service.reviewedAt}` : 'Reviewed by the FMCA clinical desk.'}
                                </p>
                                <div className="mt-4 flex items-center gap-2 border-t border-fmca-ink/10 pt-4 text-sm text-slate-600">
                                    <CheckCircle2 size={16} className="text-fmca-green" aria-hidden="true" />
                                    <span>Published content, verified before release.</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>
        </SiteShell>
    );
}
