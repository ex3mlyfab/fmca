import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import cmsSeo from '@/routes/cms/seo';

type Content = {
    type: string;
    id: number | null;
    label: string;
    publicUrl: string | null;
};

type SeoFields = {
    title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    og_image_url: string | null;
    robots: string | null;
    structured_data: string | null;
} | null;

type Props = {
    content: Content;
    seo: SeoFields;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

const ROBOTS_OPTIONS = [
    'index,follow',
    'index,nofollow',
    'noindex,follow',
    'noindex,nofollow',
];

export default function SeoEditor({ content, seo }: Props) {
    const json = seo?.structured_data ? JSON.stringify(seo.structured_data, null, 2) : '';

    return (
        <>
            <Head title={`SEO: ${content.label} | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Search</p>
                        {content.publicUrl && (
                            <a
                                href={content.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-bold text-fmca-green hover:text-fmca-green-dark"
                            >
                                View public page
                                <ExternalLink size={15} aria-hidden="true" />
                            </a>
                        )}
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">Search settings</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Overrides for <span className="font-bold text-fmca-ink">{content.label}</span>. Leave a field blank to
                        keep the automatic value generated for this page.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method="put"
                            action={cmsSeo.update.url({ content_type: content.type, content_id: content.id ?? undefined })}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="title">SEO title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            defaultValue={seo?.title ?? ''}
                                            maxLength={160}
                                            className="h-11"
                                            aria-invalid={Boolean(errors.title)}
                                        />
                                        {errors.title && <p className={fieldErrorClass}>{errors.title}</p>}
                                        <p className="text-xs text-slate-500">
                                            Shown in search results and the browser tab. A good title is under 60 characters.
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="meta_description">Meta description</Label>
                                        <textarea
                                            id="meta_description"
                                            name="meta_description"
                                            defaultValue={seo?.meta_description ?? ''}
                                            rows={3}
                                            maxLength={255}
                                            aria-invalid={Boolean(errors.meta_description)}
                                            className={textareaClass}
                                        />
                                        {errors.meta_description && <p className={fieldErrorClass}>{errors.meta_description}</p>}
                                        <p className="text-xs text-slate-500">
                                            The short blurb under the title in search results. A good one is 150–160 characters.
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="canonical_url">Canonical URL</Label>
                                        <Input
                                            id="canonical_url"
                                            name="canonical_url"
                                            defaultValue={seo?.canonical_url ?? ''}
                                            placeholder={content.publicUrl ?? ''}
                                            maxLength={2048}
                                            className="h-11"
                                            aria-invalid={Boolean(errors.canonical_url)}
                                        />
                                        {errors.canonical_url && <p className={fieldErrorClass}>{errors.canonical_url}</p>}
                                        <p className="text-xs text-slate-500">
                                            The one URL search engines should treat as the original for this content.
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="og_image_url">Social preview image (Open Graph)</Label>
                                        <Input
                                            id="og_image_url"
                                            name="og_image_url"
                                            defaultValue={seo?.og_image_url ?? ''}
                                            maxLength={2048}
                                            className="h-11"
                                            aria-invalid={Boolean(errors.og_image_url)}
                                        />
                                        {errors.og_image_url && <p className={fieldErrorClass}>{errors.og_image_url}</p>}
                                        <p className="text-xs text-slate-500">
                                            Image shown when the page is shared on social platforms.
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="robots">Indexing</Label>
                                        <select
                                            id="robots"
                                            name="robots"
                                            defaultValue={seo?.robots ?? 'index,follow'}
                                            className={selectClass}
                                            aria-invalid={Boolean(errors.robots)}
                                        >
                                            {ROBOTS_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.robots && <p className={fieldErrorClass}>{errors.robots}</p>}
                                        <p className="text-xs text-slate-500">
                                            Use noindex to keep the page out of search engines entirely.
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="structured_data">Structured data (JSON-LD)</Label>
                                        <textarea
                                            id="structured_data"
                                            name="structured_data"
                                            defaultValue={json}
                                            rows={6}
                                            aria-invalid={Boolean(errors.structured_data)}
                                            className={`font-mono text-xs ${textareaClass}`}
                                        />
                                        {errors.structured_data && <p className={fieldErrorClass}>{errors.structured_data}</p>}
                                        <p className="text-xs text-slate-500">
                                            Optional. Advanced structured data (schema.org) as valid JSON. Leave empty to use the
                                            page&apos;s built-in data.
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : 'Save SEO settings'}
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
