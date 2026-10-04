import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsMedia from '@/routes/cms/media';
import cmsPartners from '@/routes/cms/partners';

type Partner = {
    id?: number;
    name: string;
    logo: string;
    website_url?: string | null;
    sort_order?: number | null;
    owner?: string | null;
    reviewed_at?: string | null;
    status: string;
} | null;

type Props = {
    partner: Partner;
    canPublish: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function PartnerEditor({ partner, canPublish }: Props) {
    const isEditing = Boolean(partner?.id);
    const canSetStatus = canPublish || partner?.status === 'published';

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} partner | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsPartners.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Partners
                        </Link>
                        {partner && <StatusChip status={partner.status} />}
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit partner' : 'New partner'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Partners are public only while published.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsPartners.update.url(partner!.id!) : cmsPartners.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name">
                                            Partner name <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={partner?.name ?? ''}
                                            maxLength={120}
                                            className="h-11"
                                            aria-invalid={Boolean(errors.name)}
                                        />
                                        {errors.name && <p className={fieldErrorClass}>{errors.name}</p>}
                                        <p className="text-xs text-slate-500">
                                            Also used as the logo screen-reader text.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="logo">
                                                Logo URL <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <Input
                                                id="logo"
                                                name="logo"
                                                defaultValue={partner?.logo ?? ''}
                                                maxLength={255}
                                                className="h-11"
                                                aria-invalid={Boolean(errors.logo)}
                                            />
                                            {errors.logo && <p className={fieldErrorClass}>{errors.logo}</p>}
                                            <p className="text-xs text-slate-500">
                                                Upload the approved logo in the
                                                <Link
                                                    href={cmsMedia.index()}
                                                    as="button"
                                                    className="font-bold text-fmca-green hover:underline"
                                                >
                                                    media library
                                                </Link>
                                                and paste the asset URL here.
                                            </p>
                                        </div>
                                        {partner?.logo && (
                                            <div className="flex h-16 w-32 items-center justify-center overflow-hidden rounded-md border border-fmca-ink/10 bg-fmca-mist">
                                                <img src={partner.logo} alt="Partner logo preview" className="max-h-10 max-w-[104px] object-contain" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="website_url">Website URL</Label>
                                        <Input
                                            id="website_url"
                                            name="website_url"
                                            defaultValue={partner?.website_url ?? ''}
                                            maxLength={255}
                                            className="h-11"
                                            placeholder="https://partner.example"
                                            aria-invalid={Boolean(errors.website_url)}
                                        />
                                        {errors.website_url && <p className={fieldErrorClass}>{errors.website_url}</p>}
                                        <p className="text-xs text-slate-500">
                                            Optional. Leave blank for partners that have no public site.
                                        </p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="sort_order">Sort order</Label>
                                            <Input
                                                id="sort_order"
                                                name="sort_order"
                                                type="number"
                                                min={0}
                                                defaultValue={partner?.sort_order ?? 0}
                                                className="h-11"
                                                aria-invalid={Boolean(errors.sort_order)}
                                            />
                                            {errors.sort_order && <p className={fieldErrorClass}>{errors.sort_order}</p>}
                                            <p className="text-xs text-slate-500">Lower numbers appear first on the home page.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="owner">Content owner</Label>
                                            <Input
                                                id="owner"
                                                name="owner"
                                                defaultValue={partner?.owner ?? ''}
                                                maxLength={120}
                                                className="h-11"
                                            />
                                            <p className="text-xs text-slate-500">Use the team or desk name, not a single clinician.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="reviewed_at">Last reviewed</Label>
                                            <Input
                                                id="reviewed_at"
                                                name="reviewed_at"
                                                type="date"
                                                defaultValue={partner?.reviewed_at ?? ''}
                                                className="h-11"
                                                aria-invalid={Boolean(errors.reviewed_at)}
                                            />
                                            {errors.reviewed_at && <p className={fieldErrorClass}>{errors.reviewed_at}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="partner-status">Publication status</Label>
                                            <select
                                                id="partner-status"
                                                name="status"
                                                defaultValue={partner?.status ?? 'draft'}
                                                aria-invalid={Boolean(errors.status)}
                                                className={selectClass}
                                            >
                                                <option value="draft">Draft (hidden from the home page)</option>
                                                {canSetStatus && <option value="published">Published (visible on the home page)</option>}
                                            </select>
                                            {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create partner'}
                                        </Button>
                                        {recentlySuccessful && (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                <CheckCircle2 size={16} aria-hidden="true" />
                                                Saved successfully.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
