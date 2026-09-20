import { Head } from '@inertiajs/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import pageRoutes from '@/routes/page';

type GuideSummary = {
    id: number;
    title: string;
    slug: string;
    summary: string;
    owner: string | null;
    reviewed_at: string | null;
};

type Props = {
    guides: GuideSummary[];
};

export default function PatientGuides({ guides }: Props) {
    return (
        <SiteShell>
            <Head title="Patient guides | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Patient services</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">Patient guides</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            Practical guidance for patients, families and referring clinicians — patient rights,
                            admission, visiting, referrals and billing. Every guide is owned by the FMCA Patient
                            Services desk and reviewed before it is published.
                        </p>
                    </div>
                </section>

                {guides.length === 0 ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <BookOpen className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">No patient guides published yet</h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    Patient guides will appear here once the FMCA Patient Services team has approved them
                                    for publication.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {guides.map((guide) => (
                                <a
                                    key={guide.id}
                                    href={pageRoutes.patient_guide.url(guide.slug)}
                                    className="group flex min-h-44 flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-fmca-green/40 hover:shadow-md focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                                >
                                    <div>
                                        <h2 className="font-display text-lg font-bold text-fmca-green-dark group-hover:text-fmca-green">
                                            {guide.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{guide.summary}</p>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-2 text-sm font-bold text-fmca-green">
                                            <span>Read guide</span>
                                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                        </span>
                                        {guide.reviewed_at && (
                                            <span className="text-xs font-semibold tabular-nums text-slate-500">
                                                Reviewed {guide.reviewed_at}
                                            </span>
                                        )}
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
