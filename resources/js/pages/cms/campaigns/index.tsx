import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Inbox, Megaphone, PencilLine, Plus, ShieldAlert } from 'lucide-react';
import { StatusChip } from '@/pages/cms/departments';
import cmsCampaigns from '@/routes/cms/campaigns';
import { home } from '@/routes';

type Campaign = {
    id: number;
    title: string;
    eyebrow?: string | null;
    owner?: string | null;
    status: string;
    advisory: boolean;
    start_date?: string | null;
    end_date?: string | null;
    sort_order?: number | null;
};

type Props = {
    campaigns: Campaign[];
    canCreate: boolean;
};

function windowLabel(campaign: Campaign): string {
    if (!campaign.start_date && !campaign.end_date) {
        return 'No schedule — shows while published';
    }

    const start = campaign.start_date ?? 'Now';
    const end = campaign.end_date ?? 'Ongoing';
    return `Active ${start} – ${end}`;
}

export default function CampaignsIndex({ campaigns, canCreate }: Props) {
    return (
        <>
            <Head title="Campaigns | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Homepage</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Campaigns</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Manage the campaigns shown in the home page carousel. Published campaigns inside their
                                publication window are visible on the home page.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsCampaigns.create()}
                                as="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New campaign
                            </Link>
                        )}
                    </header>

                    {campaigns.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {campaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <Megaphone className="mt-0.5 shrink-0 text-fmca-teal" size={20} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{campaign.title}</h2>
                                                <StatusChip status={campaign.status} />
                                                {campaign.advisory && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-fmca-crimson/10 px-2 py-0.5 text-[11px] font-bold text-fmca-crimson">
                                                        <ShieldAlert size={13} aria-hidden="true" />
                                                        Advisory
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                {campaign.owner ? `${campaign.owner} · ` : ''}
                                                {windowLabel(campaign)}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-400">Sort order {campaign.sort_order ?? 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {campaign.status === 'published' && (
                                            <a
                                                href={home().url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                            >
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                                <span>View home</span>
                                            </a>
                                        )}
                                        <Link
                                            href={cmsCampaigns.edit(campaign.id)}
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
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No campaigns yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Campaigns you create will appear in this list and in the home page carousel while published.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsCampaigns.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Create your first campaign
                </Link>
            )}
        </div>
    );
}
