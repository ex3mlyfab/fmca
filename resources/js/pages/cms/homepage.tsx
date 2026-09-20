import { Form, Head, Link } from '@inertiajs/react';
import {
    Archive,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    FileClock,
    HeartPulse,
    History,
    MessageSquareWarning,
    PhoneCall,
    Rocket,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { home } from '@/routes';
import cms from '@/routes/cms';
import {
    archive,
    approve,
    publish,
    requestChanges,
    store as storeHomepage,
    submitForReview,
} from '@/actions/App/Http/Controllers/Cms/HomepageController';

type Configuration = {
    id?: number;
    status?: string;
    sections?: {
        hero?: { title?: string; summary?: string };
        emergency?: { message?: string; phone?: string };
        status?: { campusStatus?: string; serviceDesk?: string };
    };
} | null;

type Props = {
    configuration: Configuration;
    sections: string[];
    canApprove: boolean;
    canPublish: boolean;
    canArchive: boolean;
};

export default function HomepageWorkspace({ configuration, sections, canApprove, canPublish, canArchive }: Props) {
    const status = configuration?.status ?? 'draft';
    const [heroTitle, setHeroTitle] = useState(configuration?.sections?.hero?.title ?? 'Care information you can trust');
    const [heroSummary, setHeroSummary] = useState(
        configuration?.sections?.hero?.summary ??
        'Clear clinical guidance for patients, families and referring clinical teams across the Federal Capital Territory.'
    );

    const canSubmitForReview = Boolean(configuration?.id) && (status === 'draft' || status === 'changes_requested');

    return (
        <>
            <Head title="Homepage workspace | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-6xl">
                    <header className="flex flex-col gap-5 border-b border-fmca-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                                FMCA Content Studio | Editorial Governance
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">
                                Homepage workspace
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Configure the controlled institutional Home template, clinical alerts, and publication approvals.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={home.url()}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-fmca-green bg-white px-4 text-sm font-bold text-fmca-green shadow-xs hover:bg-fmca-mist"
                            >
                                <span>Preview public home</span>
                                <ArrowUpRight size={16} aria-hidden="true" />
                            </a>
                            {canSubmitForReview && configuration && (
                                <Link
                                    href={submitForReview.url(configuration.id!)}
                                    method="post"
                                    as="button"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm hover:bg-fmca-green-dark"
                                >
                                    <span>Submit for clinical review</span>
                                </Link>
                            )}
                            {status === 'in_review' && canApprove && configuration && (
                                <>
                                    <Link
                                        href={approve.url(configuration.id!)}
                                        method="post"
                                        as="button"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm hover:bg-fmca-green-dark"
                                    >
                                        <CheckCircle2 size={16} aria-hidden="true" />
                                        <span>Approve content</span>
                                    </Link>
                                    <Link
                                        href={requestChanges.url(configuration.id!)}
                                        method="post"
                                        as="button"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-fmca-crimson/30 bg-white px-5 text-sm font-bold text-fmca-crimson shadow-xs hover:bg-rose-50"
                                    >
                                        <MessageSquareWarning size={16} aria-hidden="true" />
                                        <span>Request changes</span>
                                    </Link>
                                </>
                            )}
                            {status === 'approved' && canPublish && configuration && (
                                <Link
                                    href={publish.url(configuration.id!)}
                                    method="post"
                                    as="button"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm hover:bg-fmca-green-dark"
                                >
                                    <Rocket size={16} aria-hidden="true" />
                                    <span>Publish to public home</span>
                                </Link>
                            )}
                            {status === 'published' && canArchive && configuration && (
                                <Link
                                    href={archive.url(configuration.id!)}
                                    method="post"
                                    as="button"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-fmca-ink/15 bg-white px-5 text-sm font-bold text-fmca-ink shadow-xs hover:bg-fmca-mist"
                                >
                                    <Archive size={16} aria-hidden="true" />
                                    <span>Archive</span>
                                </Link>
                            )}
                            <Link
                                href={cms.homepage.revisions()}
                                as="button"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-fmca-ink/15 bg-white px-4 text-sm font-bold text-fmca-ink shadow-xs hover:bg-fmca-mist"
                            >
                                <History size={16} aria-hidden="true" />
                                <span>Revision history</span>
                            </Link>
                        </div>
                    </header>

                    {/* Operational Status Badges */}
                    <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Workflow governance state">
                        <StatusCard icon={Clock3} label="Publication status" value={status.replace('_', ' ')} />
                        <StatusCard
                            icon={ShieldCheck}
                            label="Clinical governance"
                            value={
                                status === 'in_review'
                                    ? 'Awaiting approver sign-off'
                                    : status === 'approved'
                                        ? 'Approved — ready to publish'
                                        : status === 'published'
                                            ? 'Live on public home'
                                            : status === 'archived'
                                                ? 'Taken offline'
                                                : 'Clinical review required'
                            }
                        />
                        <Card className="border border-fmca-ink/10 bg-white p-5 shadow-xs">
                            <FileClock className="text-fmca-teal" size={22} aria-hidden="true" />
                            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Audit trail</p>
                            <Link
                                href={cms.audit.index()}
                                as="button"
                                className="mt-1 inline-flex items-center gap-1.5 font-display text-lg font-bold text-fmca-green-dark hover:underline"
                            >
                                Immutable log
                                <ArrowUpRight size={15} aria-hidden="true" />
                            </Link>
                        </Card>
                    </section>

                    {/* Section Configuration Form */}
                    <section className="mt-8 rounded-2xl border border-fmca-ink/10 bg-white p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center justify-between border-b border-fmca-ink/10 pb-5">
                            <div>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">
                                    Hero Campaign & Emergency Settings
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Fields enforce character length limits to prevent mobile layout clipping.
                                </p>
                            </div>
                            <span className="hidden items-center gap-2 text-xs font-bold text-fmca-green sm:flex">
                                <CheckCircle2 size={16} />
                                <span>Active Schema Guard</span>
                            </span>
                        </div>

                        <Form {...storeHomepage.form()} className="mt-7 grid gap-6" resetOnError>
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    {/* Hero Section Configuration */}
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="hero_title" className="text-sm font-bold">
                                                Hero headline (Max 120 chars)
                                            </Label>
                                            <span className={`text-xs ${heroTitle.length > 100 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                                                {heroTitle.length} / 120
                                            </span>
                                        </div>
                                        <Input
                                            id="hero_title"
                                            name="hero_title"
                                            value={heroTitle}
                                            onChange={(e) => setHeroTitle(e.target.value)}
                                            maxLength={120}
                                            aria-invalid={Boolean(errors.hero_title)}
                                            className="h-11"
                                        />
                                        {errors.hero_title && <p className="text-xs text-fmca-crimson">{errors.hero_title}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="hero_summary" className="text-sm font-bold">
                                                Hero supporting summary (Max 240 chars)
                                            </Label>
                                            <span className={`text-xs ${heroSummary.length > 200 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                                                {heroSummary.length} / 240
                                            </span>
                                        </div>
                                        <textarea
                                            id="hero_summary"
                                            name="hero_summary"
                                            value={heroSummary}
                                            onChange={(e) => setHeroSummary(e.target.value)}
                                            maxLength={240}
                                            rows={3}
                                            aria-invalid={Boolean(errors.hero_summary)}
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        />
                                        {errors.hero_summary && <p className="text-xs text-fmca-crimson">{errors.hero_summary}</p>}
                                    </div>

                                    {/* Emergency Configuration Fields */}
                                    <div className="grid gap-5 pt-4 border-t border-fmca-ink/10 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="emergency_message" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <ShieldAlert size={15} className="text-fmca-crimson" />
                                                Emergency hotbar notification (Max 160 chars)
                                            </Label>
                                            <Input
                                                id="emergency_message"
                                                name="emergency_message"
                                                defaultValue={configuration?.sections?.emergency?.message ?? 'Clinical emergency triage is active. For life-threatening emergencies, dispatch or visit directly.'}
                                                maxLength={160}
                                                aria-invalid={Boolean(errors.emergency_message)}
                                                className="h-11"
                                            />
                                            {errors.emergency_message && <p className="text-xs text-fmca-crimson">{errors.emergency_message}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="emergency_phone" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <PhoneCall size={15} className="text-fmca-crimson" />
                                                Emergency dispatch phone line
                                            </Label>
                                            <Input
                                                id="emergency_phone"
                                                name="emergency_phone"
                                                defaultValue={configuration?.sections?.emergency?.phone ?? '+2340000000000'}
                                                maxLength={30}
                                                aria-invalid={Boolean(errors.emergency_phone)}
                                                className="h-11"
                                            />
                                            {errors.emergency_phone && <p className="text-xs text-fmca-crimson">{errors.emergency_phone}</p>}
                                        </div>
                                    </div>

                                    {/* Operational Status Fields */}
                                    <div className="grid gap-5 pt-4 border-t border-fmca-ink/10 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="campus_status" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <HeartPulse size={15} className="text-fmca-teal" />
                                                Campus operational status (Max 100 chars)
                                            </Label>
                                            <Input
                                                id="campus_status"
                                                name="campus_status"
                                                defaultValue={configuration?.sections?.status?.campusStatus ?? 'Campus operations: Normal clinical capacity'}
                                                maxLength={100}
                                                aria-invalid={Boolean(errors.campus_status)}
                                                className="h-11"
                                            />
                                            {errors.campus_status && <p className="text-xs text-fmca-crimson">{errors.campus_status}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="service_desk" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                <Clock3 size={15} className="text-fmca-teal" />
                                                Service desk hours (Max 100 chars)
                                            </Label>
                                            <Input
                                                id="service_desk"
                                                name="service_desk"
                                                defaultValue={configuration?.sections?.status?.serviceDesk ?? 'Triage & desk: 24/7 active'}
                                                maxLength={100}
                                                aria-invalid={Boolean(errors.service_desk)}
                                                className="h-11"
                                            />
                                            {errors.service_desk && <p className="text-xs text-fmca-crimson">{errors.service_desk}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-fmca-ink/10">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving changes...' : 'Save draft configuration'}
                                        </Button>
                                        {recentlySuccessful && (
                                            <span className="flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                <CheckCircle2 size={16} />
                                                <span>Draft updated successfully.</span>
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>

                    {/* Ordered Section Registry */}
                    <section className="mt-8 overflow-hidden rounded-2xl border border-fmca-ink/10 bg-white shadow-xs">
                        <div className="border-b border-fmca-ink/10 px-6 py-5">
                            <h2 className="font-display text-xl font-bold text-fmca-green-dark">
                                Controlled Section Order
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Section order is locked to the approved FMCA Home Page Template to ensure patient triage and clinical priority.
                            </p>
                        </div>
                        <div className="divide-y divide-fmca-ink/10">
                            {sections.map((section, index) => (
                                <div key={section} className="flex min-h-14 items-center justify-between gap-4 px-6 py-3">
                                    <div className="flex items-center gap-4">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-fmca-mist text-xs font-bold text-fmca-green">
                                            {index + 1}
                                        </span>
                                        <span className="font-semibold text-sm text-slate-800">{section}</span>
                                    </div>
                                    <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                        Template controlled
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

function StatusCard({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
    return (
        <Card className="border border-fmca-ink/10 bg-white p-5 shadow-xs">
            <Icon className="text-fmca-teal" size={22} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-1 font-display text-lg font-bold capitalize text-fmca-green-dark">{value}</p>
        </Card>
    );
}
