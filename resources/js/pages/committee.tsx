import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, Clock3, Landmark, MessageSquare, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SiteShell } from '@/components/public/site-shell';
import { contact } from '@/routes';

type CommitteeMember = {
    id: number;
    name: string;
    slug: string;
    role: string;
    portfolio: string | null;
    mandate: string | null;
    term: string | null;
    portrait: string | null;
    owner: string | null;
    reviewedAt: string | null;
};

type Props = {
    members: CommitteeMember[];
    latestReviewedAt: string | null;
};

export default function Committee({ members, latestReviewedAt }: Props) {
    return (
        <SiteShell>
            <Head title="Top Management Committee | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Institutional governance</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">
                            Top Management Committee
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            The Top Management Committee provides institutional leadership and oversight for the academic,
                            clinical, and administrative direction of the Federal Medical Centre, Abuja.
                        </p>
                    </div>
                </section>

                {members.length === 0 ? (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="flex flex-col items-center gap-4 rounded-xl border border-fmca-ink/10 bg-white p-12 text-center shadow-xs">
                            <Landmark className="text-fmca-teal" size={32} aria-hidden="true" />
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">
                                    No committee members published yet
                                </h2>
                                <p className="mt-2 max-w-md text-sm text-slate-600">
                                    Committee member profiles will appear here once FMCA Corporate Communications has
                                    completed and verified them for publication.
                                </p>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                        <div className="grid gap-5 sm:grid-cols-2">
                            {members.map((member) => (
                                <article
                                    key={member.id}
                                    className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-fmca-ink/10 bg-fmca-mist text-fmca-teal">
                                            {member.portrait ? (
                                                <img
                                                    src={member.portrait}
                                                    alt={`Portrait of ${member.name}`}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <UserRound size={28} aria-hidden="true" />
                                            )}
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="font-display text-lg font-bold text-fmca-green-dark">{member.name}</h2>
                                            <p className="mt-1 text-sm font-semibold text-slate-700">{member.role}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        {member.portfolio && (
                                            <Badge variant="secondary" className="bg-fmca-mist text-slate-700">
                                                {member.portfolio}
                                            </Badge>
                                        )}
                                        {member.term && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold tabular-nums text-slate-600">
                                                <Clock3 size={14} aria-hidden="true" />
                                                {member.term}
                                            </span>
                                        )}
                                    </div>

                                    {member.mandate && (
                                        <p className="mt-4 text-sm leading-relaxed text-slate-600">{member.mandate}</p>
                                    )}
                                </article>
                            ))}
                        </div>

                        <div className="mt-8 grid gap-5 lg:grid-cols-2">
                            <div className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-6">
                                <div className="flex items-center gap-2 text-sm font-bold text-fmca-green-dark">
                                    <Landmark size={18} className="text-fmca-teal" aria-hidden="true" />
                                    <span>Committee queries</span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Enquiries about the committee are handled through the FMCA feedback form. Appointment
                                    requests and clinical matters continue to be routed through the clinical desk.
                                </p>
                                <Button asChild className="mt-4 h-11 w-full bg-fmca-green font-bold hover:bg-fmca-green-dark lg:w-auto lg:px-5">
                                    <Link href={contact()}>
                                        <MessageSquare size={16} aria-hidden="true" />
                                        Contact FMCA
                                    </Link>
                                </Button>
                            </div>

                            <div className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-6">
                                <div className="flex items-center gap-2 text-sm font-bold text-fmca-green-dark">
                                    <BadgeCheck size={18} className="text-fmca-teal" aria-hidden="true" />
                                    <span>Content reviewed</span>
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {latestReviewedAt
                                        ? `Last reviewed ${latestReviewedAt}.`
                                        : 'Reviewed by FMCA Corporate Communications.'}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </SiteShell>
    );
}
