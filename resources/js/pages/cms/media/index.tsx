import { Form, Head, Link } from '@inertiajs/react';
import { Image as ImageIcon, Inbox, PencilLine, Plus, Trash2, UploadCloud, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import cmsMedia from '@/routes/cms/media';

type MediaItem = {
    id: number;
    label: string;
    kind: string;
    url: string;
    fileName: string;
    sizeBytes?: number | null;
    altText?: string | null;
    owner?: string | null;
    reviewedAt?: string | null;
    canDelete: boolean;
};

type Props = {
    media: MediaItem[];
    canUpload: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const fileInputClass =
    'h-11 w-full cursor-pointer rounded-md border border-dashed border-fmca-ink/25 bg-white px-3 text-sm text-slate-600 file:ml-3 file:border-0 file:bg-fmca-mist file:px-3 file:py-2 file:text-xs file:font-bold file:text-fmca-green dark:bg-transparent file:dark:bg-transparent focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

function formatBytes(size?: number | null): string {
    if (!size) {
        return '';
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(0)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaIndex({ media, canUpload }: Props) {
    return (
        <>
            <Head title="Media | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Media &amp; Publications</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Media library</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Approved imagery and short video for campaigns, blocks and home page modules.
                                Upload new assets, keep alt text and ownership current, and mark each item when it
                                is reviewed.
                            </p>
                        </div>
                    </header>

                    {canUpload && <UploadForm />}

                    {media.length === 0 ? (
                        <EmptyState canUpload={canUpload} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {media.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-start gap-4">
                                        {item.kind === 'video' ? (
                                            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-fmca-mist text-fmca-teal">
                                                <Video size={22} aria-hidden="true" />
                                            </div>
                                        ) : (
                                            <img
                                                src={item.url}
                                                alt={item.altText ?? item.label}
                                                className="size-14 shrink-0 rounded-lg border border-fmca-ink/10 object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{item.label}</h2>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                    {item.kind === 'video' ? <Video size={13} aria-hidden="true" /> : <ImageIcon size={13} aria-hidden="true" />}
                                                    {item.kind}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                {item.owner ? `${item.owner} · ` : ''}
                                                {item.reviewedAt ? `Reviewed ${item.reviewedAt}` : 'Not yet reviewed'}
                                                {item.sizeBytes ? ` · ${formatBytes(item.sizeBytes)}` : ''}
                                            </p>
                                            {item.altText && <p className="mt-0.5 truncate text-xs text-slate-500">Alt: {item.altText}</p>}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Link
                                            href={cmsMedia.edit(item.id)}
                                            as="button"
                                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <PencilLine size={15} aria-hidden="true" />
                                            <span>Edit</span>
                                        </Link>
                                        {item.canDelete && (
                                            <Form
                                                method="delete"
                                                action={cmsMedia.destroy(item.id)}
                                                as="button"
                                                onClick={(event) => {
                                                    if (!window.confirm(`Delete “${item.label}” from the media library? This cannot be undone.`)) {
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

function UploadForm() {
    return (
        <div className="mt-8 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-2">
                <UploadCloud size={20} className="text-fmca-green" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">Upload media</h2>
            </div>
            <Form method="post" action={cmsMedia.store.url()} resetOnError>
                {({ errors, processing }) => (
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="media-label">
                                Label <span className="text-fmca-crimson">*</span>
                            </Label>
                            <Input id="media-label" name="label" maxLength={120} className="h-11" aria-invalid={Boolean(errors.label)} />
                            {errors.label && <p className={fieldErrorClass}>{errors.label}</p>}
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="media-kind">Type</Label>
                            <select id="media-kind" name="kind" defaultValue="image" className={selectClass}>
                                <option value="image">Image (jpg, png, webp, gif · 4 MB max)</option>
                                <option value="video">Video (mp4, webm, mov · 50 MB max)</option>
                            </select>
                            {errors.kind && <p className={fieldErrorClass}>{errors.kind}</p>}
                        </div>
                        <div className="grid gap-1.5 sm:col-span-2">
                            <Label htmlFor="media-file">
                                File <span className="text-fmca-crimson">*</span>
                            </Label>
                            <input id="media-file" name="file" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov" className={fileInputClass} aria-invalid={Boolean(errors.file)} />
                            {errors.file && <p className={fieldErrorClass}>{errors.file}</p>}
                        </div>
                        <div className="grid gap-1.5 sm:col-span-2">
                            <Label htmlFor="media-alt">
                                Alt text <span className="text-fmca-crimson">*</span>
                            </Label>
                            <Input id="media-alt" name="alt_text" maxLength={500} className="h-11" aria-invalid={Boolean(errors.alt_text)} />
                            {errors.alt_text && <p className={fieldErrorClass}>{errors.alt_text}</p>}
                            <p className="text-xs text-slate-500">Describe what the asset shows. It is used for accessible rendering of campaigns and blocks.</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="media-owner">Content owner</Label>
                            <Input id="media-owner" name="owner" maxLength={120} className="h-11" />
                            <p className="text-xs text-slate-500">Team or desk name, not a single person.</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="media-reviewed">Last reviewed</Label>
                            <input id="media-reviewed" name="reviewed_at" type="date" className={selectClass} />
                        </div>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-fmca-green px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky disabled:opacity-50"
                            >
                                <Plus size={18} aria-hidden="true" />
                                {processing ? 'Uploading…' : 'Add to library'}
                            </button>
                        </div>
                    </div>
                )}
            </Form>
        </div>
    );
}

function EmptyState({ canUpload }: { canUpload: boolean }) {
    return (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
            <Inbox className="text-slate-400" size={32} aria-hidden="true" />
            <div>
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No media yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Approved imagery and video you upload will appear in this list and can be used in campaigns and
                    page blocks.
                </p>
            </div>
            {canUpload && (
                <p className="text-xs text-slate-500">Use the upload panel above to add your first asset.</p>
            )}
        </div>
    );
}
