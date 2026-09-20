import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2, Clock3, Mail, PhoneCall } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { departments } from '@/routes';
import serviceRoutes from '@/routes/services';

type Department = {
    id: number;
    name: string;
    slug: string;
    summary: string;
    description: string;
    contactPhone: string | null;
    contactEmail: string | null;
    owner: string | null;
    reviewedAt: string | null;
};

type ServiceInDepartment = {
    id: number;
    name: string;
    slug: string;
    summary: string;
};

type Props = {
    department: Department;
    services: ServiceInDepartment[];
};

export default function Department({ department, services }: Props) {
    return (
        <SiteShell>
            <Head title={`${department.name} | Federal Medical Centre, Abuja`} />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                        <nav aria-label="Breadcrumb" className="mb-5">
                            <Link
                                href={departments.url()}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-fmca-green hover:text-fmca-green-dark"
                            >
                                <Building2 size={16} aria-hidden="true" />
                                All departments
                            </Link>
                        </nav>
                        <h1 className="font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">{department.name}</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">{department.summary}</p>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">About this department</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                                    {department.description}
                                </p>
                            </div>

                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">Services</h2>
                                {services.length === 0 ? (
                                    <p className="mt-3 text-sm text-slate-600">
                                        Published services for this department will be listed here once approved by the clinical desk.
                                    </p>
                                ) : (
                                    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                                        {services.map((service) => (
                                            <li key={service.id}>
                                                <a
                                                    href={serviceRoutes.show.url(service.slug)}
                                                    className="group flex min-h-28 flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-fmca-green/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                                                >
                                                    <div>
                                                        <h3 className="font-display text-base font-bold text-fmca-green-dark group-hover:text-fmca-green">
                                                            {service.name}
                                                        </h3>
                                                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{service.summary}</p>
                                                    </div>
                                                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                        <span>View service</span>
                                                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                                    </span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <aside className="space-y-4">
                            {(department.contactPhone || department.contactEmail) && (
                                <div className="rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs">
                                    <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">Contact</h2>
                                    <ul className="mt-3 space-y-3 text-sm">
                                        {department.contactPhone && (
                                            <li className="flex items-center gap-2 text-slate-700">
                                                <PhoneCall size={16} className="text-fmca-teal" aria-hidden="true" />
                                                {department.contactPhone}
                                            </li>
                                        )}
                                        {department.contactEmail && (
                                            <li className="flex items-center gap-2 text-slate-700">
                                                <Mail size={16} className="text-fmca-teal" aria-hidden="true" />
                                                {department.contactEmail}
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-5">
                                <div className="flex items-center gap-2 text-sm font-bold text-fmca-green-dark">
                                    <Clock3 size={18} className="text-fmca-teal" aria-hidden="true" />
                                    <span>Content reviewed</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                    {department.reviewedAt ? `Last reviewed ${department.reviewedAt}` : 'Reviewed by the FMCA clinical desk.'}
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>
        </SiteShell>
    );
}
