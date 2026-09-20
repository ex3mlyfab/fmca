import { Head, Link } from '@inertiajs/react';
import { CalendarPlus, Clock3, Stethoscope, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteShell } from '@/components/public/site-shell';
import { appointments, consultants } from '@/routes';
import departmentRoutes from '@/routes/departments';

type DepartmentRef = {
    name: string;
    slug: string;
} | null;

type Consultant = {
    id: number;
    name: string;
    slug: string;
    specialty: string;
    position: string | null;
    biography: string | null;
    portrait: string | null;
    specialtyTags: string[];
    department: DepartmentRef;
    owner: string | null;
    reviewedAt: string | null;
};

type Props = {
    consultant: Consultant;
};

export default function Consultant({ consultant }: Props) {
    return (
        <SiteShell>
            <Head title={`${consultant.name} | Federal Medical Centre, Abuja`} />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                        <nav aria-label="Breadcrumb" className="mb-5">
                            <Link
                                href={consultants.url()}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-fmca-green hover:text-fmca-green-dark"
                            >
                                <UserRound size={16} aria-hidden="true" />
                                All consultants
                            </Link>
                        </nav>
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-fmca-ink/10 bg-white text-fmca-teal shadow-xs">
                                {consultant.portrait ? (
                                    <img
                                        src={consultant.portrait}
                                        alt={`Portrait of ${consultant.name}`}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <UserRound size={40} aria-hidden="true" />
                                )}
                            </span>
                            <div>
                                <h1 className="font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">{consultant.name}</h1>
                                <p className="mt-2 text-base font-semibold text-slate-700">
                                    {consultant.position ?? 'Consultant'}, {consultant.specialty}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
                    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">About this consultant</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                                    {consultant.biography ?? 'The full profile for this consultant is being completed by the clinical desk.'}
                                </p>
                            </div>

                            {consultant.specialtyTags.length > 0 && (
                                <div>
                                    <h2 className="font-display text-xl font-bold text-fmca-green-dark">Focus areas</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {consultant.specialtyTags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="bg-fmca-mist text-slate-700">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="space-y-4">
                            {consultant.department && (
                                <div className="rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs">
                                    <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">Department</h2>
                                    <a
                                        href={departmentRoutes.show.url(consultant.department.slug)}
                                        className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-fmca-green hover:text-fmca-green-dark"
                                    >
                                        <Stethoscope size={16} aria-hidden="true" />
                                        {consultant.department.name}
                                    </a>
                                </div>
                            )}

                            <div className="rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs">
                                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">Contact pathway</h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Appointment requests are routed through the FMCA clinical desk; availability and scheduling are
                                    confirmed by the relevant unit.
                                </p>
                                <Button asChild className="mt-4 h-11 w-full bg-fmca-green font-bold hover:bg-fmca-green-dark">
                                    <Link href={appointments()}>
                                        <CalendarPlus size={16} aria-hidden="true" />
                                        Request an appointment
                                    </Link>
                                </Button>
                            </div>

                            <div className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-5">
                                <div className="flex items-center gap-2 text-sm font-bold text-fmca-green-dark">
                                    <Clock3 size={18} className="text-fmca-teal" aria-hidden="true" />
                                    <span>Content reviewed</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                    {consultant.reviewedAt
                                        ? `Last reviewed ${consultant.reviewedAt}`
                                        : 'Reviewed by the FMCA clinical desk.'}
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>
        </SiteShell>
    );
}
