import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Globe, Inbox, PencilLine, Plus, UserRound } from 'lucide-react';
import { StatusChip } from '@/pages/cms/departments';
import cmsCommittees from '@/routes/cms/committees';
import cmsSeo from '@/routes/cms/seo';
import publicAbout from '@/routes/about';

type Member = {
    id: number;
    name: string;
    slug: string;
    role: string;
    portfolio: string | null;
    status: string;
    owner: string | null;
    reviewed_at: string | null;
};

type Props = {
    members: Member[];
    canCreate: boolean;
};

export default function CommitteesIndex({ members, canCreate }: Props) {
    return (
        <>
            <Head title="Top Management Committee | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                                Content Studio | Institutional Content
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">
                                Top Management Committee
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Manage committee member profiles. Only approved, published members appear on the
                                public site.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Link
                                href={cmsSeo.edit.url({ content_type: 'committees' })}
                                as="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-fmca-ink/15 bg-white px-4 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Globe size={17} aria-hidden="true" />
                                <span>Page SEO</span>
                            </Link>
                            {canCreate && (
                                <Link
                                    href={cmsCommittees.create()}
                                    as="button"
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                                >
                                    <Plus size={18} aria-hidden="true" />
                                    New member
                                </Link>
                            )}
                        </div>
                    </header>

                    {members.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <UserRound className="mt-0.5 shrink-0 text-fmca-teal" size={20} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{member.name}</h2>
                                                <StatusChip status={member.status} />
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                {member.role}
                                                {member.portfolio ? ` · ${member.portfolio}` : ''}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                /{member.slug}
                                                {member.reviewed_at ? ` · Reviewed ${member.reviewed_at}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {member.status === 'published' && (
                                            <a
                                                href={publicAbout.leadership().url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                            >
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                                <span>View</span>
                                            </a>
                                        )}
                                        <Link
                                            href={cmsCommittees.edit(member.id)}
                                            as="button"
                                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <PencilLine size={15} aria-hidden="true" />
                                            <span>Edit</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
    return (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
            <Inbox className="text-slate-400" size={32} aria-hidden="true" />
            <div>
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No committee members yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Members you create appear here and are shown publicly once approved and published.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsCommittees.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Create your first member
                </Link>
            )}
        </div>
    );
}
