import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsCampaigns from '@/routes/cms/campaigns';
import cmsMedia from '@/routes/cms/media';

type Campaign = {
    id?: number;
    title: string;
    eyebrow?: string | null;
    copy: string;
    primary_cta_label?: string | null;
    primary_cta_href?: string | null;
    secondary_cta_label?: string | null;
    secondary_cta_href?: string | null;
    desktop_media?: string | null;
    mobile_media?: string | null;
    media_alt?: string | null;
    focal_point?: string | null;
    video_poster?: string | null;
    overlay_intensity?: number | null;
    owner: string;
    advisory: boolean;
    start_date?: string | null;
    end_date?: string | null;
    sort_order?: number | null;
    status: string;
    reviewed_at?: string | null;
} | null;

type Props = {
    campaign: Campaign;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const FOCAL_POINTS = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

export default function CampaignEditor({ campaign }: Props) {
    const isEditing = Boolean(campaign?.id);

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} campaign | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsCampaigns.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Campaigns
                        </Link>
                        {campaign && <StatusChip status={campaign.status} />}
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit campaign' : 'New campaign'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Unpublished campaigns are not shown on the home page.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsCampaigns.update.url(campaign!.id!) : cmsCampaigns.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="title">
                                            Title <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="title" name="title" defaultValue={campaign?.title ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.title)} />
                                        {errors.title && <p className={fieldErrorClass}>{errors.title}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="eyebrow">Eyebrow</Label>
                                        <Input id="eyebrow" name="eyebrow" defaultValue={campaign?.eyebrow ?? ''} maxLength={120} className="h-11" />
                                        <p className="text-xs text-slate-500">Short uppercase context line shown above the title.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="copy">
                                            Supporting copy <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <textarea
                                            id="copy"
                                            name="copy"
                                            defaultValue={campaign?.copy ?? ''}
                                            rows={4}
                                            aria-invalid={Boolean(errors.copy)}
                                            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40"
                                        />
                                        {errors.copy && <p className={fieldErrorClass}>{errors.copy}</p>}
                                        <p className="text-xs text-slate-500">Do not state fees, availability or clinical advice.</p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="primary_cta_label">Primary CTA label</Label>
                                            <Input id="primary_cta_label" name="primary_cta_label" defaultValue={campaign?.primary_cta_label ?? ''} maxLength={80} className="h-11" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="primary_cta_href">Primary CTA link</Label>
                                            <Input id="primary_cta_href" name="primary_cta_href" defaultValue={campaign?.primary_cta_href ?? ''} maxLength={255} className="h-11" />
                                            <p className="text-xs text-slate-500">Anchor or route, for example <code>#services</code>.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="secondary_cta_label">Secondary CTA label</Label>
                                            <Input id="secondary_cta_label" name="secondary_cta_label" defaultValue={campaign?.secondary_cta_label ?? ''} maxLength={80} className="h-11" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="secondary_cta_href">Secondary CTA link</Label>
                                            <Input id="secondary_cta_href" name="secondary_cta_href" defaultValue={campaign?.secondary_cta_href ?? ''} maxLength={255} className="h-11" />
                                        </div>
                                    </div>

                                    <div className="border-t border-fmca-ink/10 pt-5">
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Media</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Upload approved assets in the
                                            <Link href={cmsMedia.index()} as="button" className="font-bold text-fmca-green hover:underline">
                                                media library
                                            </Link>
                                            and paste the asset URL here. Leave the fields blank and the carousel
                                            renders on the institutional green background.
                                        </p>
                                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="desktop_media">Desktop media URL</Label>
                                                <Input id="desktop_media" name="desktop_media" defaultValue={campaign?.desktop_media ?? ''} maxLength={255} className="h-11" />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="mobile_media">Mobile media URL</Label>
                                                <Input id="mobile_media" name="mobile_media" defaultValue={campaign?.mobile_media ?? ''} maxLength={255} className="h-11" />
                                                <p className="text-xs text-slate-500">If blank, the desktop media is used on small screens.</p>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="media_alt">Media alt text</Label>
                                                <Input id="media_alt" name="media_alt" defaultValue={campaign?.media_alt ?? ''} maxLength={255} className="h-11" />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="focal_point">Focal point</Label>
                                                <select
                                                    id="focal_point"
                                                    name="focal_point"
                                                    defaultValue={campaign?.focal_point ?? 'center'}
                                                    className={selectClass}
                                                >
                                                    {FOCAL_POINTS.map((point) => (
                                                        <option key={point} value={point}>
                                                            {point}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid gap-1.5 sm:col-span-2">
                                                <Label htmlFor="video_poster">Video poster URL</Label>
                                                <Input id="video_poster" name="video_poster" defaultValue={campaign?.video_poster ?? ''} maxLength={255} className="h-11" />
                                            </div>
                                            <div className="grid gap-1.5 sm:col-span-2">
                                                <Label htmlFor="overlay_intensity">Overlay intensity (0–100)</Label>
                                                <input
                                                    id="overlay_intensity"
                                                    name="overlay_intensity"
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    step={5}
                                                    defaultValue={campaign?.overlay_intensity ?? 40}
                                                    className={selectClass}
                                                    aria-invalid={Boolean(errors.overlay_intensity)}
                                                />
                                                {errors.overlay_intensity && <p className={fieldErrorClass}>{errors.overlay_intensity}</p>}
                                                <p className="text-xs text-slate-500">How strongly the green scrim darkens the media.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="start_date">Start date</Label>
                                            <input id="start_date" name="start_date" type="date" defaultValue={campaign?.start_date ?? ''} className={selectClass} aria-invalid={Boolean(errors.start_date)} />
                                            {errors.start_date && <p className={fieldErrorClass}>{errors.start_date}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="end_date">End date</Label>
                                            <input id="end_date" name="end_date" type="date" defaultValue={campaign?.end_date ?? ''} className={selectClass} aria-invalid={Boolean(errors.end_date)} />
                                            {errors.end_date && <p className={fieldErrorClass}>{errors.end_date}</p>}
                                            <p className="text-xs text-slate-500">Leave blank for no fixed window. The campaign only shows on the home page while published and inside this window.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="owner">
                                                Content owner <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <Input id="owner" name="owner" defaultValue={campaign?.owner ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.owner)} />
                                            {errors.owner && <p className={fieldErrorClass}>{errors.owner}</p>}
                                            <p className="text-xs text-slate-500">Use the team or desk name, not a single clinician.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="sort_order">Sort order</Label>
                                            <input id="sort_order" name="sort_order" type="number" min={0} step={1} defaultValue={campaign?.sort_order ?? 0} className={selectClass} aria-invalid={Boolean(errors.sort_order)} />
                                            {errors.sort_order && <p className={fieldErrorClass}>{errors.sort_order}</p>}
                                            <p className="text-xs text-slate-500">Lower numbers appear first in the carousel.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="hidden"
                                            name="advisory"
                                            value="0"
                                        />
                                        <div className="grid gap-1.5">
                                            <label htmlFor="advisory" className="flex items-center gap-2 text-sm font-medium text-fmca-ink">
                                                <input
                                                    id="advisory"
                                                    name="advisory"
                                                    type="checkbox"
                                                    value="1"
                                                    defaultChecked={Boolean(campaign?.advisory)}
                                                    className="size-4 rounded border-input"
                                                />
                                                Emergency / advisory content
                                            </label>
                                            <p className="text-xs text-slate-500">Advisory campaigns never auto-advance in the carousel.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status">Publication status</Label>
                                        <select id="status" name="status" defaultValue={campaign?.status ?? 'draft'} className={selectClass} aria-invalid={Boolean(errors.status)}>
                                            <option value="draft">Draft (hidden from the home page)</option>
                                            <option value="review">In review (awaiting approval)</option>
                                            <option value="published">Published (visible on the home page)</option>
                                        </select>
                                        {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
                                        <p className="text-xs text-slate-500">Publishing is only available to staff with the publish campaigns right.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="reviewed_at">Last reviewed date</Label>
                                        <input
                                            id="reviewed_at"
                                            name="reviewed_at"
                                            type="date"
                                            defaultValue={campaign?.reviewed_at ? String(campaign.reviewed_at).slice(0, 10) : ''}
                                            className={selectClass}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create campaign'}
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
