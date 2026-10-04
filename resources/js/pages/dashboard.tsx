import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    Archive,
    ArrowUpRight,
    Ban,
    Building2,
    CalendarCheck2,
    CheckCircle2,
    Clock3,
    FileText,
    Globe,
    Hospital,
    Hourglass,
    Inbox,
    LayoutGrid,
    LayoutTemplate,
    Megaphone,
    MessageSquareText,
    Newspaper,
    PencilLine,
    Plus,
    ScrollText,
    ShieldCheck,
    Stethoscope,
    Trash2,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard, home } from '@/routes';
import cms from '@/routes/cms';

type RouteLink = { url: string; method: 'get' };

type ContentRow = {
    type: string;
    label: string;
    slug: string;
    total: number;
    published: number;
    review: number;
    pending: number;
};

type ReviewItem = {
    type: string;
    id: number;
    title: string;
    status: string;
    submittedAt: string | null;
};

type PatientItem = {
    type: 'appointment' | 'message';
    id: number;
    title: string;
    detail: string | null;
    createdAt: string | null;
};

type PatientInbox = {
    newCount: number;
    items: PatientItem[];
};

type ActivityItem = {
    id: number;
    action: string;
    contentType: string | null;
    actorName: string;
    summary: string | null;
    createdAt: string | null;
};

type Props = {
    userName: string | null;
    content: ContentRow[];
    publishedTotal: number;
    reviewTotal: number;
    mediaAssets: number;
    activeCampaigns: number;
    pendingReview: ReviewItem[];
    appointmentRequests: PatientInbox;
    contactSubmissions: PatientInbox;
    activity: ActivityItem[];
};

const CONTENT_ICONS: Record<string, LucideIcon> = {
    departments: Building2,
    services: Stethoscope,
    clinics: Hospital,
    consultants: UserRound,
    news: Newspaper,
    campaigns: Megaphone,
    pages: LayoutTemplate,
    documents: FileText,
    homepage: LayoutGrid,
};

const MANAGE_LINKS: Record<string, RouteLink> = {
    departments: cms.departments.index(),
    services: cms.services.index(),
    clinics: cms.clinics.index(),
    consultants: cms.consultants.index(),
    news: cms.news.index(),
    campaigns: cms.campaigns.index(),
    pages: cms.pages.index(),
    documents: cms.documents.index(),
    homepage: cms.homepage.edit(),
};

const REVIEW_TYPES: Record<string, { label: string; icon: LucideIcon; link: (id: number) => RouteLink }> = {
    homepage: { label: 'Homepage', icon: LayoutGrid, link: () => cms.homepage.edit() },
    campaigns: { label: 'Campaign', icon: Megaphone, link: (id) => cms.campaigns.edit(id) },
    news: { label: 'News item', icon: Newspaper, link: (id) => cms.news.edit(id) },
    clinics: { label: 'Clinic', icon: Hospital, link: (id) => cms.clinics.edit(id) },
    pages: { label: 'Page', icon: LayoutTemplate, link: (id) => cms.pages.edit(id) },
};

const ACTION_META: Record<string, { icon: LucideIcon; tile: string; verb: string }> = {
    created: { icon: Plus, tile: 'bg-sky-50 text-sky-700', verb: 'created' },
    updated: { icon: PencilLine, tile: 'bg-slate-100 text-slate-600', verb: 'updated' },
    submitted_for_review: { icon: Hourglass, tile: 'bg-amber-100 text-amber-700', verb: 'submitted' },
    changes_requested: { icon: AlertCircle, tile: 'bg-amber-100 text-amber-700', verb: 'asked for changes on' },
    approved: { icon: ShieldCheck, tile: 'bg-emerald-50 text-emerald-700', verb: 'approved' },
    published: { icon: CheckCircle2, tile: 'bg-emerald-50 text-emerald-700', verb: 'published' },
    archived: { icon: Archive, tile: 'bg-slate-100 text-slate-600', verb: 'archived' },
    restored: { icon: Clock3, tile: 'bg-sky-50 text-sky-700', verb: 'restored' },
    deleted: { icon: Trash2, tile: 'bg-red-50 text-red-700', verb: 'deleted' },
    deleted_attempted: { icon: Ban, tile: 'bg-slate-100 text-slate-600', verb: 'attempted to delete' },
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
    home: 'the homepage',
    institute_profile: 'the about page',
    campaign: 'a campaign',
    department: 'a department',
    service: 'a service',
    clinic: 'a clinic',
    consultant: 'a consultant',
    post: 'a news item',
    document: 'a publication',
    page: 'a page',
    media: 'a media asset',
    category: 'a category',
    user: 'an account',
    redirect: 'a URL redirect',
    seo: 'an SEO entry',
    revision: 'a revision',
};

const EMPTY_META = { icon: Activity, tile: 'bg-slate-100 text-slate-600', verb: 'changed' } as const;

export default function Dashboard({
    userName,
    content,
    publishedTotal,
    reviewTotal,
    mediaAssets,
    activeCampaigns,
    pendingReview,
    appointmentRequests,
    contactSubmissions,
    activity,
}: Props) {
    const firstName = userName?.split(' ')[0];
    const openRequests = appointmentRequests.newCount + contactSubmissions.newCount;
    const campaignsInStudio = content.find((row) => row.type === 'campaigns')?.total ?? 0;

    return (
        <>
            <Head title="Dashboard | FMCA Content Studio" />
            <div className="flex min-h-screen flex-col gap-6 bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Overview</p>
                            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-fmca-green-dark sm:text-4xl">
                                {greeting()}, {firstName ?? 'there'}.
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                                {publishedTotal === 0
                                    ? 'Nothing is live yet — publish departments and services to open the public site to patients.'
                                    : `${pluralSubject(publishedTotal, 'piece of content', 'pieces of content', 'is', 'are')} live for patients, ${pluralSubject(reviewTotal, 'item', 'items', 'is', 'are')} waiting for clinical review, and ${pluralSubject(openRequests, 'patient request', 'patient requests', 'needs', 'need')} a staff reply.`}
                            </p>
                        </div>
                        <a
                            href={home().url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                        >
                            <Globe size={18} aria-hidden="true" />
                            View public site
                        </a>
                    </header>

                    <section aria-label="Studio at a glance" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={CheckCircle2}
                            strip="bg-fmca-green"
                            tile="bg-fmca-green/10 text-fmca-green"
                            value={publishedTotal}
                            label="Pieces of content live"
                            subline={`${plural(activeCampaigns, 'campaign', 'campaigns')} live on the homepage · ${plural(mediaAssets, 'media asset', 'media assets')}`}
                        />
                        <StatCard
                            icon={Hourglass}
                            strip="bg-amber-400"
                            tile="bg-amber-100 text-amber-700"
                            value={reviewTotal}
                            label="Waiting for clinical review"
                            subline={reviewTotal > 0 ? 'Review keeps unapproved content off the public site' : 'Nothing is blocked on review'}
                            action={{ label: 'Open queue', href: '#review-queue' }}
                        />
                        <StatCard
                            icon={CalendarCheck2}
                            strip="bg-fmca-sky"
                            tile="bg-sky-100 text-sky-700"
                            value={openRequests}
                            label="Patient requests unanswered"
                            subline={`${plural(appointmentRequests.newCount, 'appointment request', 'appointment requests')} · ${plural(contactSubmissions.newCount, 'contact message', 'contact messages')}`}
                        />
                        <StatCard
                            icon={Megaphone}
                            strip="bg-fmca-teal"
                            tile="bg-fmca-mist text-fmca-teal"
                            value={activeCampaigns}
                            label="Campaigns live right now"
                            subline={`${plural(campaignsInStudio, 'campaign', 'campaigns')} in the studio`}
                            action={{ label: 'Manage campaigns', href: cms.campaigns.index() }}
                        />
                    </section>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <ContentMix content={content} className="lg:col-span-2" />
                        <ReviewQueue items={pendingReview} reviewTotal={reviewTotal} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <ActivityFeed activity={activity} className="lg:col-span-2" />
                        <PatientRequests
                            appointmentRequests={appointmentRequests}
                            contactSubmissions={contactSubmissions}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon: Icon,
    strip,
    tile,
    value,
    label,
    subline,
    action,
}: {
    icon: LucideIcon;
    strip: string;
    tile: string;
    value: number;
    label: string;
    subline: string;
    action?: { label: string; href: string | RouteLink };
}) {
    return (
        <div className="min-w-0 relative flex flex-col gap-4 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white p-5 shadow-xs">
            <div className={`absolute inset-x-0 top-0 h-1.5 ${strip}`} aria-hidden="true" />
            <div className="flex items-start justify-between gap-3">
                <span className={`flex size-11 items-center justify-center rounded-lg ${tile}`}>
                    <Icon size={22} aria-hidden="true" />
                </span>
                {action &&
                    (typeof action.href === 'object' ? (
                        <Link
                            href={action.href}
                            as="button"
                            className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowUpRight size={14} aria-hidden="true" />
                            {action.label}
                        </Link>
                    ) : (
                        <a
                            href={action.href}
                            className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowUpRight size={14} aria-hidden="true" />
                            {action.label}
                        </a>
                    ))}
            </div>
            <div>
                <p className="font-display text-3xl font-extrabold tabular-nums text-fmca-ink">{value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{subline}</p>
            </div>
        </div>
    );
}

function ContentMix({ content, className }: { content: ContentRow[]; className?: string }) {
    const liveCount = content.filter((row) => row.published > 0).length;
    const allEmpty = content.every((row) => row.total === 0);

    return (
        <section className={`min-w-0 rounded-xl border border-fmca-ink/10 bg-white shadow-xs ${className ?? ''}`}>
            <header className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">Content mix</h2>
                    <p className="mt-1 text-xs text-slate-600">
                        {liveCount} of {content.length} content types are live on the public site
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-fmca-green" aria-hidden="true" />
                        Live
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-amber-400" aria-hidden="true" />
                        In review
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-slate-300" aria-hidden="true" />
                        Not live
                    </span>
                </div>
            </header>

            {allEmpty ? (
                <div className="flex flex-col items-center gap-4 p-12 text-center">
                    <Inbox className="text-slate-400" size={32} aria-hidden="true" />
                    <p className="text-sm text-slate-600">
                        No content yet. Start with a department, then publish a service so patients can find care.
                    </p>
                    <Link
                        href={cms.departments.create()}
                        as="button"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                    >
                        <Plus size={18} aria-hidden="true" />
                        Create your first department
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-fmca-ink/10">
                    {content.map((row) => (
                        <ContentRowItem key={row.type} row={row} />
                    ))}
                </div>
            )}
        </section>
    );
}

function ContentRowItem({ row }: { row: ContentRow }) {
    const Icon = CONTENT_ICONS[row.type] ?? LayoutGrid;
    const href = MANAGE_LINKS[row.type];

    return (
        <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green">
                    <Icon size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-fmca-ink">{row.label}</p>
                    <p className="truncate text-xs text-slate-600">
                        {row.slug} · {plural(row.total, 'item', 'items')}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-full md:w-40">
                    <div
                        className="flex h-2 overflow-hidden rounded-full bg-slate-100"
                        role="img"
                        aria-label={`${row.published} live, ${row.review} in review, ${row.pending} not live of ${row.total} ${row.label.toLowerCase()}`}
                    >
                        {row.total === 0 ? (
                            <span className="h-full w-full bg-slate-200" />
                        ) : (
                            <>
                                <span className="h-full bg-fmca-green" style={segment(row.published, row.total)} />
                                <span className="h-full bg-amber-400" style={segment(row.review, row.total)} />
                                <span className="h-full bg-slate-300" style={segment(row.pending, row.total)} />
                            </>
                        )}
                    </div>
                </div>
                <p className="w-32 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
                    {row.published} live{row.review > 0 ? ` · ${row.review} in review` : ''}
                </p>
                {href && (
                    <Link
                        href={href}
                        as="button"
                        className="hidden min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky md:inline-flex"
                    >
                        Manage
                    </Link>
                )}
            </div>
        </div>
    );
}

function ReviewQueue({ items, reviewTotal }: { items: ReviewItem[]; reviewTotal: number }) {
    const visible = items.slice(0, 6);
    const hidden = items.length - visible.length;

    return (
        <section id="review-queue" className="min-w-0 rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
            <header className="flex items-center justify-between gap-3 border-b border-fmca-ink/10 p-5">
                <div>
                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">Awaiting clinical review</h2>
                    <p className="mt-1 text-xs text-slate-600">Nothing reaches patients until a clinical approver signs off</p>
                </div>
                <span className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md bg-amber-100 px-2.5 text-xs font-bold text-amber-700">
                    <Hourglass size={14} aria-hidden="true" />
                    {reviewTotal}
                </span>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <CheckCircle2 className="text-fmca-green" size={28} aria-hidden="true" />
                    <p className="text-sm font-semibold text-fmca-green-dark">Nothing is waiting</p>
                    <p className="max-w-56 text-xs text-slate-600">Items you submit for review appear here for the clinical approver.</p>
                </div>
            ) : (
                <ul className="divide-y divide-fmca-ink/10">
                    {visible.map((item) => {
                        const meta = REVIEW_TYPES[item.type] ?? {
                            label: item.type,
                            icon: LayoutGrid,
                            link: () => cms.departments.index(),
                        };
                        const Icon = meta.icon;

                        return (
                            <li key={`${item.type}-${item.id}`}>
                                <Link
                                    href={meta.link(item.id)}
                                    as="button"
                                    className="flex w-full items-start gap-3 p-5 text-left transition-colors hover:bg-fmca-mist/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fmca-sky"
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green">
                                        <Icon size={19} aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-bold text-fmca-ink">{item.title}</span>
                                        <span className="mt-0.5 block text-xs text-slate-600">
                                            {meta.label} · {formatRelativeTime(item.submittedAt)}
                                        </span>
                                    </span>
                                    <StatusBadge status={item.status} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {hidden > 0 && (
                <p className="border-t border-fmca-ink/10 p-4 text-center text-xs font-semibold text-slate-600">
                    +{hidden} more awaiting review
                </p>
            )}
        </section>
    );
}

function ActivityFeed({ activity, className }: { activity: ActivityItem[]; className?: string }) {
    return (
        <section className={`min-w-0 rounded-xl border border-fmca-ink/10 bg-white shadow-xs ${className ?? ''}`}>
            <header className="flex items-center justify-between gap-3 border-b border-fmca-ink/10 p-5">
                <div>
                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">Recent activity</h2>
                    <p className="mt-1 text-xs text-slate-600">The latest governance events across the studio</p>
                </div>
                <Link
                    href={cms.audit.index()}
                    as="button"
                    className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                >
                    <ScrollText size={14} aria-hidden="true" />
                    Full audit log
                </Link>
            </header>

            {activity.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <ScrollText className="text-slate-400" size={28} aria-hidden="true" />
                    <p className="text-sm text-slate-600">Nothing recorded yet — every publish, approval, and archive is logged here.</p>
                </div>
            ) : (
                <ul className="divide-y divide-fmca-ink/10">
                    {activity.map((entry) => {
                        const meta = ACTION_META[entry.action] ?? EMPTY_META;
                        const Icon = meta.icon;

                        return (
                            <li key={entry.id} className="flex items-start gap-3 p-5">
                                <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${meta.tile}`}>
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-snug text-fmca-ink">
                                        <span className="font-bold">{entry.actorName}</span>{' '}
                                        <span className="font-medium">{meta.verb}</span>{' '}
                                        <span className="font-bold">{contentTypeLabel(entry.contentType)}</span>
                                    </p>
                                    {entry.summary && <p className="mt-1 text-xs text-slate-600">{entry.summary}</p>}
                                </div>
                                <time className="shrink-0 text-xs tabular-nums text-slate-600">
                                    {formatRelativeTime(entry.createdAt)}
                                </time>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

function PatientRequests({
    appointmentRequests,
    contactSubmissions,
}: {
    appointmentRequests: PatientInbox;
    contactSubmissions: PatientInbox;
}) {
    const items = [...appointmentRequests.items, ...contactSubmissions.items].slice(0, 6);
    const openCount = appointmentRequests.newCount + contactSubmissions.newCount;

    return (
        <section className="min-w-0 flex flex-col rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
            <header className="flex items-center justify-between gap-3 border-b border-fmca-ink/10 p-5">
                <div>
                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">Patient requests</h2>
                    <p className="mt-1 text-xs text-slate-600">New submissions waiting for a staff follow-up</p>
                </div>
                <span className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md bg-sky-100 px-2.5 text-xs font-bold text-sky-700">
                    <Inbox size={14} aria-hidden="true" />
                    {openCount}
                </span>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <CheckCircle2 className="text-fmca-green" size={28} aria-hidden="true" />
                    <p className="text-sm font-semibold text-fmca-green-dark">No unanswered requests</p>
                    <p className="max-w-56 text-xs text-slate-600">New appointment requests and contact messages land here.</p>
                </div>
            ) : (
                <ul className="flex-1 divide-y divide-fmca-ink/10">
                    {items.map((item) => {
                        const Icon = item.type === 'appointment' ? CalendarCheck2 : MessageSquareText;

                        return (
                            <li key={`${item.type}-${item.id}`} className="flex items-start gap-3 p-5">
                                <span
                                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                                        item.type === 'appointment' ? 'bg-sky-100 text-sky-700' : 'bg-fmca-mist text-fmca-teal'
                                    }`}
                                >
                                    <Icon size={18} aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-fmca-ink">{item.title}</p>
                                    {item.detail && <p className="mt-1 truncate text-xs text-slate-600">{item.detail}</p>}
                                </div>
                                <span className="shrink-0 text-xs tabular-nums text-slate-600">{formatRelativeTime(item.createdAt)}</span>
                            </li>
                        );
                    })}
                </ul>
            )}

            <p className="flex items-start gap-2 border-t border-fmca-ink/10 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
                <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                Appointment requests are requests for follow-up, not confirmed appointments.
            </p>
        </section>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'published') {
        return (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={13} aria-hidden="true" />
                Published
            </span>
        );
    }

    if (status === 'review' || status === 'in_review') {
        return (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                <Hourglass size={13} aria-hidden="true" />
                In review
            </span>
        );
    }

    if (status === 'changes_requested') {
        return (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                <AlertCircle size={13} aria-hidden="true" />
                Changes
            </span>
        );
    }

    if (status === 'archived') {
        return (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                <Archive size={13} aria-hidden="true" />
                Archived
            </span>
        );
    }

    return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
            <Clock3 size={13} aria-hidden="true" />
            Draft
        </span>
    );
}

function greeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    if (hour < 18) {
        return 'Good afternoon';
    }

    return 'Good evening';
}

function plural(count: number, singular: string, plural: string): string {
    return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

/** "1 item is" / "4 items are" — keeps the summary sentence grammatical at any count. */
function pluralSubject(count: number, singular: string, plural: string, singularVerb: string, pluralVerb: string): string {
    return `${count.toLocaleString()} ${count === 1 ? singular : plural} ${count === 1 ? singularVerb : pluralVerb}`;
}

function contentTypeLabel(contentType: string | null): string {
    if (contentType === null) {
        return 'content';
    }

    return CONTENT_TYPE_LABELS[contentType] ?? `a ${contentType}`;
}

function segment(value: number, total: number): { width: string } {
    return { width: total > 0 ? `${(value / total) * 100}%` : '0%' };
}

function formatRelativeTime(iso: string | null): string {
    if (!iso) {
        return 'Not recorded';
    }

    const then = new Date(iso).getTime();

    if (Number.isNaN(then)) {
        return 'Not recorded';
    }

    const seconds = Math.round((Date.now() - then) / 1000);

    if (seconds < 60) {
        return 'Just now';
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    return new Date(then).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
