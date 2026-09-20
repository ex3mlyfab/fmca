import { Head } from '@inertiajs/react';
import { ArrowRight, UserRound, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SiteShell } from '@/components/public/site-shell';
import consultantRoutes from '@/routes/consultants';

type ConsultantSummary = {
    id: number;
    name: string;
    slug: string;
    specialty: string;
    position: string | null;
    department: string | null;
};

type Props = {
    consultants: ConsultantSummary[];
};

export default function Consultants({ consultants }: Props) {
    return (
        <SiteShell>
            <Head title="Consultants | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Approved consultant profiles</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">Consultants</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            Consultant profiles shown here have been completed and approved by the FMCA clinical desk.
                        </p>
                    </div>
                </section>

                {consultants.length === 0 ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <Users className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">No consultant profiles published yet</h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    Approved consultant profiles will appear here once the clinical content owner has completed and
                                    verified them for publication.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {consultants.map((consultant) => (
                                <a
                                    key={consultant.id}
                                    href={consultantRoutes.show.url(consultant.slug)}
                                    className="group flex min-h-44 flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-fmca-green/40 hover:shadow-md focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fmca-mist text-fmca-teal">
                                            <UserRound size={24} aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="font-display text-lg font-bold text-fmca-green-dark group-hover:text-fmca-green">
                                                {consultant.name}
                                            </h2>
                                            <p className="mt-1 text-sm font-semibold text-slate-600">{consultant.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between">
                                        <Badge variant="secondary" className="bg-fmca-mist text-slate-700">
                                            {consultant.department ?? 'FMCA'}
                                        </Badge>
                                        <span className="inline-flex items-center gap-2 text-sm font-bold text-fmca-green">
                                            <span>View profile</span>
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
