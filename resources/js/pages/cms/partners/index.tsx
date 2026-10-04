import { Form, Head, Link } from '@inertiajs/react';
import { Handshake, Inbox, PencilLine, Plus, Trash2 } from 'lucide-react';
import { StatusChip } from '@/pages/cms/departments';
import cmsPartners from '@/routes/cms/partners';

type Partner = {
    id: number;
    name: string;
    logo: string;
    websiteUrl: string | null;
    sortOrder: number;
    status: string;
    owner: string | null;
    reviewedAt: string | null;
    canDelete: boolean;
};

type Props = {
    partners: Partner[];
    canCreate: boolean;
};

export default function PartnersIndex({ partners, canCreate }: Props) {
    return (
        <>
            <Head title="Partners | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                                Content Studio | Institutional Content
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">
                                Partners
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Manage the partner logos shown on the public home page. Only published partners
                                appear, in sort order.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsPartners.create()}
                                as="button"
                                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New partner
                            </Link>
                        )}
                    </header>

                    {partners.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {partners.map((partner) => (
                                <div
                                    key={partner.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-fmca-ink/10 bg-fmca-mist">
                                            <img
                                                src={partner.logo}
                                                alt={`${partner.name} logo`}
                                                className="max-h-9 max-w-[84px] object-contain"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{partner.name}</h2>
                                                <StatusChip status={partner.status} />
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                Order {partner.sortOrder}
                                                {partner.websiteUrl ? ` · ${partner.websiteUrl}` : ''}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {partner.owner ?? 'No owner recorded'}
                                                {partner.reviewedAt ? ` · Reviewed ${partner.reviewedAt}` : ' · Not yet reviewed'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Link
                                            href={cmsPartners.edit(partner.id)}
                                            as="button"
                                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <PencilLine size={15} aria-hidden="true" />
                                            <span>Edit</span>
                                        </Link>
                                        {partner.canDelete && (
                                            <Form
                                                method="delete"
                                                action={cmsPartners.destroy(partner.id)}
                                                as="button"
                                                onClick={(event) => {
                                                    if (!window.confirm(`Delete “${partner.name}” from the partners list? This cannot be undone.`)) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-crimson/30 bg-white px-3 text-sm font-bold text-fmca-crimson transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                            >
                                                <Trash2 size={15} aria-hidden="true" />
                                                <span>Delete</span>
                                            </Form>
                                        )}
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
            <Handshake className="text-slate-400" size={32} aria-hidden="true" />
            <div>
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No partners yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Partners you add appear here and are shown on the public home page once published.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsPartners.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Create your first partner
                </Link>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Inbox size={13} aria-hidden="true" />
                Draft partners are hidden from the public site until published.
            </div>
        </div>
    );
}
