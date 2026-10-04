import { Form, Head } from '@inertiajs/react';
import { Monitor, Smartphone, Trash2, Upload } from 'lucide-react';
import { FmcaEmblem } from '@/components/public/site-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsBrandIdentity from '@/routes/cms/brand-identity';
import { home } from '@/routes';

type SlotKey = 'header_logo' | 'footer_logo' | 'favicon' | 'apple_touch_icon';

type SlotDefinition = {
    label: string;
    surface: string;
    formats: string;
};

type Asset = {
    id: number;
    url: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    altText: string | null;
    owner: string | null;
    reviewedAt: string | null;
    status: string;
    canDelete: boolean;
};

type Props = {
    slots: Record<SlotKey, SlotDefinition>;
    assets: Partial<Record<SlotKey, Asset>>;
    maxKilobytes: Partial<Record<SlotKey, number>>;
    canPublish: boolean;
};

// Mirrors `BrandAsset::allowedMimeTypes` and the server-side validation rules.
// The server is authoritative; this only shapes the file picker.
const ACCEPT: Record<SlotKey, string> = {
    header_logo: 'image/png,image/jpeg,image/webp,image/svg+xml',
    footer_logo: 'image/png,image/jpeg,image/webp,image/svg+xml',
    favicon: 'image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg,image/webp',
    apple_touch_icon: 'image/png',
};

const ALT_TEXT_SLOTS: SlotKey[] = ['header_logo', 'footer_logo'];

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const fileInputClass =
    'h-11 w-full cursor-pointer rounded-md border border-dashed border-fmca-ink/25 bg-white px-3 text-sm text-slate-600 file:ml-3 file:border-0 file:bg-fmca-mist file:px-3 file:py-2 file:text-xs file:font-bold file:text-fmca-green dark:bg-transparent file:dark:bg-transparent focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function BrandIdentityIndex({ slots, assets, maxKilobytes, canPublish }: Props) {
    return (
        <>
            <Head title="Brand Identity | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                            Content Studio | Site Configuration
                        </p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Brand Identity</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                            Upload the logos that appear on the public site and the icons browsers and phones use for the
                            tab and home screen. A slot is public only once published; remove it to fall back to the
                            built-in emblem and the default icons.
                        </p>
                    </header>

                    {!canPublish && (
                        <p className="mt-4 rounded-xl border border-fmca-ink/10 bg-white p-4 text-sm text-slate-600 shadow-xs">
                            You can upload and revise assets, but publishing needs the <span className="font-semibold text-fmca-ink">brand publishing</span> right.
                            Slots you upload stay in draft until a publisher approves them.
                        </p>
                    )}

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        {(Object.keys(slots) as SlotKey[]).map((slot) => (
                            <SlotCard
                                key={slot}
                                slot={slot}
                                definition={slots[slot]}
                                asset={assets[slot]}
                                maxKilobytes={maxKilobytes[slot]}
                                canPublish={canPublish}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function SlotCard({
    slot,
    definition,
    asset,
    maxKilobytes,
    canPublish,
}: {
    slot: SlotKey;
    definition: SlotDefinition;
    asset: Asset | undefined;
    maxKilobytes: number | undefined;
    canPublish: boolean;
}) {
    const canSetStatus = canPublish || asset?.status === 'published';
    const maxMegabytes = maxKilobytes !== undefined ? maxKilobytes / 1024 : null;
    const altTextSlot = ALT_TEXT_SLOTS.includes(slot);

    return (
        <section className="rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">{definition.label}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{definition.surface}</p>
                </div>
                {asset && <StatusChip status={asset.status} />}
            </div>

            <div className="mt-5">
                <BrandPreview slot={slot} asset={asset} />
            </div>

            {asset ? (
                <p className="mt-3 text-xs leading-5 text-slate-600">
                    <span className="font-semibold text-fmca-ink">{asset.fileName}</span>
                    {' · '}
                    {asset.mimeType}
                    {' · '}
                    {formatBytes(asset.sizeBytes)}
                    {asset.owner ? ` · ${asset.owner}` : ''}
                    {asset.reviewedAt ? ` · Reviewed ${asset.reviewedAt}` : ''}
                </p>
            ) : (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                    No asset in this slot — the public site is showing its built-in default.
                </p>
            )}

            <Form method="put" action={cmsBrandIdentity.update.url()} className="mt-5">
                {({ errors, processing, recentlySuccessful }) => (
                    <div className="grid gap-5">
                        <div className="grid gap-1.5">
                            <Label htmlFor={`slot-${slot}-file`}>
                                {asset ? 'Replace asset' : 'Upload asset'}
                            </Label>
                            <Input
                                id={`slot-${slot}-file`}
                                name={`slots.${slot}.file`}
                                type="file"
                                accept={ACCEPT[slot]}
                                className={fileInputClass}
                                aria-invalid={Boolean(errors[`slots.${slot}.file`])}
                            />
                            <p className="text-xs text-slate-600">
                                {definition.formats}
                                {maxMegabytes !== null ? ` · under ${maxMegabytes} MB` : ''}
                            </p>
                            {errors[`slots.${slot}.file`] && (
                                <p className={fieldErrorClass}>{errors[`slots.${slot}.file`]}</p>
                            )}
                        </div>

                        {altTextSlot && (
                            <div className="grid gap-1.5">
                                <Label htmlFor={`slot-${slot}-alt`}>Alt text</Label>
                                <Input
                                    id={`slot-${slot}-alt`}
                                    name={`slots.${slot}.alt_text`}
                                    type="text"
                                    defaultValue={asset?.altText ?? ''}
                                    maxLength={255}
                                    placeholder="Federal Medical Centre, Abuja"
                                    className="h-11"
                                    aria-invalid={Boolean(errors[`slots.${slot}.alt_text`])}
                                />
                                <p className="text-xs text-slate-600">
                                    Describes the mark to screen readers. Leave empty to use the institution name.
                                </p>
                                {errors[`slots.${slot}.alt_text`] && (
                                    <p className={fieldErrorClass}>{errors[`slots.${slot}.alt_text`]}</p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor={`slot-${slot}-owner`}>Owner</Label>
                                <Input
                                    id={`slot-${slot}-owner`}
                                    name={`slots.${slot}.owner`}
                                    type="text"
                                    defaultValue={asset?.owner ?? ''}
                                    maxLength={120}
                                    placeholder="Communications desk"
                                    className="h-11"
                                    aria-invalid={Boolean(errors[`slots.${slot}.owner`])}
                                />
                                {errors[`slots.${slot}.owner`] && (
                                    <p className={fieldErrorClass}>{errors[`slots.${slot}.owner`]}</p>
                                )}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor={`slot-${slot}-reviewed`}>Reviewed on</Label>
                                <Input
                                    id={`slot-${slot}-reviewed`}
                                    name={`slots.${slot}.reviewed_at`}
                                    type="date"
                                    defaultValue={asset?.reviewedAt ?? ''}
                                    className="h-11"
                                    aria-invalid={Boolean(errors[`slots.${slot}.reviewed_at`])}
                                />
                                {errors[`slots.${slot}.reviewed_at`] && (
                                    <p className={fieldErrorClass}>{errors[`slots.${slot}.reviewed_at`]}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor={`slot-${slot}-status`}>Publication status</Label>
                            <select
                                id={`slot-${slot}-status`}
                                name={`slots.${slot}.status`}
                                defaultValue={asset?.status ?? 'draft'}
                                aria-invalid={Boolean(errors[`slots.${slot}.status`])}
                                className={selectClass}
                            >
                                <option value="draft">Draft (hidden from public site)</option>
                                {canSetStatus && <option value="published">Published (visible publicly)</option>}
                            </select>
                            {errors[`slots.${slot}.status`] && (
                                <p className={fieldErrorClass}>{errors[`slots.${slot}.status`]}</p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-11 inline-flex items-center justify-center gap-2 bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark disabled:opacity-50"
                            >
                                <Upload size={16} aria-hidden="true" />
                                {processing ? 'Saving…' : asset ? 'Save changes' : 'Upload and save'}
                            </Button>
                            {recentlySuccessful && (
                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                    Saved
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </Form>

            {asset?.canDelete && (
                <Form method="delete" action={cmsBrandIdentity.destroy.url(asset.id)} className="mt-4">
                    <Button
                        type="submit"
                        onClick={(event) => {
                            if (!window.confirm(`Remove ${definition.label.toLowerCase()} from this slot? The public site falls back to its built-in default and the file is deleted.`)) {
                                event.preventDefault();
                            }
                        }}
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-crimson/30 bg-white px-3 text-sm font-bold text-fmca-crimson transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                    >
                        <Trash2 size={15} aria-hidden="true" />
                        Remove asset
                    </Button>
                </Form>
            )}
        </section>
    );
}

function BrandPreview({ slot, asset }: { slot: SlotKey; asset: Asset | undefined }) {
    switch (slot) {
        case 'header_logo':
            return (
                <div className="flex h-24 items-center justify-center rounded-xl border border-fmca-ink/10 bg-white px-4">
                    {asset ? (
                        <img src={asset.url} alt="" className="h-11 max-w-full object-contain" />
                    ) : (
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <FmcaEmblem className="size-8" /> Built-in emblem
                        </span>
                    )}
                </div>
            );

        case 'footer_logo':
            return (
                <div className="flex h-24 items-center justify-center rounded-xl border border-fmca-ink/10 bg-fmca-green-dark px-4">
                    {asset ? (
                        <img src={asset.url} alt="" className="h-10 max-w-full object-contain" />
                    ) : (
                        <span className="flex items-center gap-2 text-xs font-semibold text-white/70">
                            <FmcaEmblem className="size-8" /> Built-in emblem
                        </span>
                    )}
                </div>
            );

        case 'favicon':
            return (
                <div className="flex h-24 items-center gap-3 rounded-xl border border-fmca-ink/10 bg-fmca-mist px-4">
                    <div className="flex h-12 items-center gap-2 rounded-t-lg border border-b-0 border-fmca-ink/15 bg-white px-3">
                        {asset ? (
                            <img src={asset.url} alt="" className="size-6 shrink-0 object-contain" />
                        ) : (
                            <img src="/favicon.svg" alt="" className="size-6 shrink-0 object-contain" />
                        )}
                        <span className="truncate text-xs text-slate-600">FMCA</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Monitor size={14} aria-hidden="true" />
                        Browser tab & bookmarks
                    </span>
                </div>
            );

        case 'apple_touch_icon':
        default:
            return (
                <div className="flex h-24 items-center gap-3 rounded-xl border border-fmca-ink/10 bg-fmca-mist px-4">
                    {asset ? (
                        <img src={asset.url} alt="" className="size-16 shrink-0 rounded-2xl border border-fmca-ink/10 object-cover" />
                    ) : (
                        <img src="/apple-touch-icon.png" alt="" className="size-16 shrink-0 rounded-2xl border border-fmca-ink/10 object-cover" />
                    )}
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Smartphone size={14} aria-hidden="true" />
                        Saved to the home screen
                    </span>
                </div>
            );
    }
}

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
