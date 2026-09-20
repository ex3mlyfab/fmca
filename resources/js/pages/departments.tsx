import { Head } from '@inertiajs/react';
import { ArrowRight, Building2, FolderOpen } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { Badge } from '@/components/ui/badge';
import departmentRoutes from '@/routes/departments';

type DepartmentSummary = {
    id: number;
    name: string;
    slug: string;
    summary: string;
    servicesCount: number;
};

type Props = {
    departments: DepartmentSummary[];
};

export default function Departments({ departments }: Props) {
    return (
        <SiteShell>
            <Head title="Departments | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Clinical departments</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">Departments &amp; centres of excellence</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            FMCA's specialised clinical divisions. Each department page lists its published services and is
                            verified by the clinical desk.
                        </p>
                    </div>
                </section>

                {departments.length === 0 ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <Building2 className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">No departments published yet</h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    Clinical departments will appear here once the FMCA content team has approved them for publication.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {departments.map((department) => (
                                <a
                                    key={department.id}
                                    href={departmentRoutes.show.url(department.slug)}
                                    className="group flex min-h-44 flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-fmca-green/40 hover:shadow-md focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                                >
                                    <div>
                                        <Building2 className="mb-3 text-fmca-teal" size={24} aria-hidden="true" />
                                        <h2 className="font-display text-lg font-bold text-fmca-green-dark group-hover:text-fmca-green">
                                            {department.name}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{department.summary}</p>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between">
                                        <Badge variant="secondary" className="bg-fmca-mist text-slate-700">
                                            <FolderOpen size={14} aria-hidden="true" />
                                            {department.servicesCount === 0
                                                ? 'No published services'
                                                : `${department.servicesCount} service${department.servicesCount === 1 ? '' : 's'}`}
                                        </Badge>
                                        <span className="inline-flex items-center gap-2 text-sm font-bold text-fmca-green">
                                            <span>View</span>
                                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </SiteShell>
    );
}
