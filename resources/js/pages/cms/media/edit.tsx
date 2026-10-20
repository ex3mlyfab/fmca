import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Image as ImageIcon, Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import cmsMedia from '@/routes/cms/media';

type Media = {
    id: number;
    label: string;
    kind: string;
    url: string;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    fileName: string;
    altText?: string | null;
    owner?: string | null;
    reviewedAt?: string | null;
    canDelete: boolean;
};

type Props = {
    media: Media;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const fileInputClass =
    'h-11 w-full cursor-pointer rounded-md border border-dashed border-fmca-ink/25 bg-white px-3 text-sm text-slate-600 file:ml-3 file:border-0 file:bg-fmca-mist file:px-3 file:py-2 file:text-xs file:font-bold file:text-fmca-green dark:bg-transparent file:dark:bg-transparent focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function MediaEditor({ media }: Props) {
    return (
        <>
            <Head title={`Edit ${media.label} | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsMedia.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Media library
                        </Link>
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">Edit media</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Update the details, or replace the asset with a newer file. Alt text and ownership stay
                        visible to the whole team.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <div className="flex items-center gap-4 border-b border-fmca-ink/10 pb-5">
                            {media.kind === 'video' ? (
                                <video src={media.url} controls className="h-24 rounded-lg border border-fmca-ink/10 bg-slate-900 object-cover" preload="metadata" />
                            ) : (
                                <img
                                    src={media.mediumUrl}
                                    alt={media.altText ?? media.label}
                                    className="h-24 rounded-lg border border-fmca-ink/10 object-cover"
                                />
                            )}
                            <div className="min-w-0">
                                <p className="font-display text-base font-bold text-fmca-green-dark">{media.label}</p>
                                <p className="mt-1 truncate text-xs text-slate-500">
                                    {media.fileName} ·{' '}
                                    {media.kind === 'video' ? (
                                        <span className="inline-flex items-center gap-1"><Video size={12} aria-hidden="true" /> video</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1"><ImageIcon size={12} aria-hidden="true" /> image</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <Form method="put" action={cmsMedia.update.url(media.id)} resetOnError>
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5 pt-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="media-label">
                                            Label <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="media-label" name="label" defaultValue={media.label} maxLength={120} className="h-11" aria-invalid={Boolean(errors.label)} />
                                        {errors.label && <p className={fieldErrorClass}>{errors.label}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="media-kind">Type</Label>
                                        <select id="media-kind" name="kind" defaultValue={media.kind} className={selectClass}>
                                            <option value="image">Image (jpg, png, webp, gif · 4 MB max)</option>
                                            <option value="video">Video (mp4, webm, mov · 50 MB max)</option>
                                        </select>
                                        {errors.kind && <p className={fieldErrorClass}>{errors.kind}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="media-file">Replace file</Label>
                                        <input id="media-file" name="file" type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov" className={fileInputClass} aria-invalid={Boolean(errors.file)} />
                                        {errors.file && <p className={fieldErrorClass}>{errors.file}</p>}
                                        <p className="text-xs text-slate-500">Optional. Choosing a file replaces the current one.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="media-alt">
                                            Alt text <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="media-alt" name="alt_text" defaultValue={media.altText ?? ''} maxLength={500} className="h-11" aria-invalid={Boolean(errors.alt_text)} />
                                        {errors.alt_text && <p className={fieldErrorClass}>{errors.alt_text}</p>}
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="media-owner">Content owner</Label>
                                            <Input id="media-owner" name="owner" defaultValue={media.owner ?? ''} maxLength={120} className="h-11" />
                                            <p className="text-xs text-slate-500">Team or desk name, not a single person.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="media-reviewed">Last reviewed</Label>
                                            <input
                                                id="media-reviewed"
                                                name="reviewed_at"
                                                type="date"
                                                defaultValue={media.reviewedAt ?? ''}
                                                className={selectClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : 'Save changes'}
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

                        {media.canDelete && (
                            <div className="mt-6 border-t border-fmca-ink/10 pt-5">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Danger zone</p>
                                <Form
                                    method="delete"
                                    action={cmsMedia.destroy(media.id)}
                                    as="button"
                                    onClick={(event) => {
                                        if (!window.confirm(`Delete “${media.label}” from the media library? This cannot be undone.`)) {
                                            event.preventDefault();
                                        }
                                    }}
                                    className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-fmca-crimson/30 bg-white px-4 text-sm font-bold text-fmca-crimson transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                    Delete this media
                                </Form>
                                <p className="mt-2 text-xs text-slate-500">Deleting removes the file and its library record.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
