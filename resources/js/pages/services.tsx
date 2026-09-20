import { Head } from '@inertiajs/react';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { Badge } from '@/components/ui/badge';
import serviceRoutes from '@/routes/services';

type ServiceSummary = {
    id: number;
    name: string;
    slug: string;
    summary: string;
    department: string | null;
};

type Props = {
    services: ServiceSummary[];
};

export default function Services({ services }: Props) {
    return (
        <SiteShell>
            <Head title="Services | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Clinical services directory</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">Our services</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            Published clinical and support services offered across FMCA. Every entry is verified by the
                            clinical desk before it is published.
                        </p>
                    </div>
                </section>

                {services.length === 0 ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <Stethoscope className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">No services published yet</h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    Clinical services will appear here once the FMCA content team has approved them for publication.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => (
                                <a
                                    key={service.id}
                                    href={serviceRoutes.show.url(service.slug)}
                                    className="group flex min-h-44 flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-fmca-green/40 hover:shadow-md focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                                >
                                    <div>
                                        {service.department && (
                                            <Badge variant="outline" className="mb-3 border-fmca-green/30 text-fmca-green">
                                                {service.department}
                                            </Badge>
                                        )}
                                        <h2 className="font-display text-lg font-bold text-fmca-green-dark group-hover:text-fmca-green">
                                            {service.name}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.summary}</p>
                                    </div>
                                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fmca-green">
                                        <span>View service</span>
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                    </span>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </SiteShell>
    );
}
