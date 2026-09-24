import { Form, Head, Link } from '@inertiajs/react';
import { useId, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Globe, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { StatusChip } from '@/pages/cms/departments';
import cmsPages from '@/routes/cms/pages';
import cmsSeo from '@/routes/cms/seo';

type TemplateOption = {
    id: number;
    key: string;
    name: string;
    purpose: string;
    url_prefix: string | null;
    routable: boolean;
    requires_owner: boolean;
    requires_summary: boolean;
    required_fields: string[];
    permitted_blocks: string[];
    default_owner: string | null;
};

type BlockCatalogEntry = {
    key: string;
    label: string;
    placeholder: string;
};

type PageBlockEditor = {
    block_key: string;
    content: Record<string, unknown>;
    sort_order: number;
};

type PageData = {
    id?: number;
    title: string;
    slug: string;
    summary: string | null;
    owner: string | null;
    status: string;
    reviewed_at: string | null;
    template_id: number;
    template_key: string | null;
    blocks: PageBlockEditor[];
} | null;

type Props = {
    page: PageData;
    templates: TemplateOption[];
    blockCatalog: BlockCatalogEntry[];
    /** Preselected template key, set by the `start` route's `?template=` query. */
    templateKey?: string;
};

/** Minimal valid-JSON starting point for each block type in the editor. */
const BLOCK_SKELETONS: Record<string, string> = {
    rich_text: JSON.stringify({ heading: '', body: '' }, null, 2),
    steps: JSON.stringify({ title: '', steps: [] }, null, 2),
    alert: JSON.stringify({ tone: 'info', title: '', body: '' }, null, 2),
    faq: JSON.stringify({ title: '', items: [] }, null, 2),
    document_list: JSON.stringify({ title: '', documents: [] }, null, 2),
    cta: JSON.stringify({ label: '', href: '' }, null, 2),
    contact_panel: JSON.stringify({ title: '', note: '' }, null, 2),
};

type EditorBlock = {
    key: string;
    json: string;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 font-mono text-xs leading-relaxed text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

/**
 * Form editor for a rich_text block: a heading field plus the visual rich text
 * editor. The two fields serialise into the block's JSON `content` through a
 * hidden input, so the server contract (blocks.N.content = JSON string) is
 * unchanged.
 */
function RichTextBlockEditor({ index, initialJson, error }: { index: number; initialJson: string; error?: string }) {
    const parsed = useMemo(() => {
        try {
            return JSON.parse(initialJson) as { heading?: unknown; body?: unknown };
        } catch {
            return {};
        }
    }, [initialJson]);
    const [heading, setHeading] = useState(String(parsed.heading ?? ''));
    const [body, setBody] = useState(String(parsed.body ?? ''));
    const headingId = useId();

    return (
        <div className="mt-3 grid gap-4">
            <div className="grid gap-1.5">
                <Label htmlFor={headingId}>Heading</Label>
                <Input
                    id={headingId}
                    value={heading}
                    onChange={(event) => setHeading(event.target.value)}
                    maxLength={120}
                    placeholder="Optional block heading"
                />
            </div>
            <div className="grid gap-1.5">
                <Label>Body</Label>
                <RichTextEditor
                    value={body}
                    onContentChange={setBody}
                    label="Rich text body"
                    placeholder="Write the block content. Use the toolbar to format it."
                />
            </div>
            <input type="hidden" name={`blocks.${index}.content`} value={JSON.stringify({ heading, body })} />
            <p className="text-xs leading-relaxed text-slate-500">
                Body is formatted with the visual editor and stored as HTML. Links must be internal paths or http(s)
                URLs.
            </p>
            {error && <p className={`mt-2 ${fieldErrorClass}`}>{error}</p>}
        </div>
    );
}

export default function PageEditor({ page, templates, blockCatalog, templateKey }: Props) {
    const isEditing = Boolean(page?.id);
    const preferredKey = templateKey ?? page?.template_key;

    const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>(
        page?.template_id ?? templates.find((t) => t.key === preferredKey)?.id ?? templates[0]?.id,
    );
    const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
        (page?.blocks ?? []).map((block) => ({ key: block.block_key, json: JSON.stringify(block.content, null, 2) })),
    );
    const [newBlockKey, setNewBlockKey] = useState('');

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    const permittedKeys = selectedTemplate?.permitted_blocks ?? [];
    const addableKeys = permittedKeys.filter((key) => !blocks.some((block) => block.key === key));
    const labelFor = (key: string) => blockCatalog.find((entry) => entry.key === key)?.label ?? key;

    const addBlock = () => {
        if (!newBlockKey) {
            return;
        }
        setBlocks((prev) => [...prev, { key: newBlockKey, json: BLOCK_SKELETONS[newBlockKey] ?? '{}' }]);
        setNewBlockKey('');
    };

    const removeBlock = (index: number) => {
        setBlocks((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} page | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsPages.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Pages
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                            {page && <StatusChip status={page.status} />}
                            {page?.id && (
                                <Link
                                    href={cmsSeo.edit.url({ content_type: 'page', content_id: page.id })}
                                    as="button"
                                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                >
                                    <Globe size={15} aria-hidden="true" />
                                    <span>SEO</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit page' : 'New page'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Blocks must be valid JSON; each template only allows its own
                        content blocks.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsPages.update.url(page!.id!) : cmsPages.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="template_id">
                                            Template <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <select
                                            id="template_id"
                                            name="template_id"
                                            value={selectedTemplateId ?? 0}
                                            onChange={(event) => setSelectedTemplateId(Number(event.target.value))}
                                            className={selectClass}
                                            aria-invalid={Boolean(errors.template_id)}
                                        >
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.template_id && <p className={fieldErrorClass}>{errors.template_id}</p>}
                                        {selectedTemplate && (
                                            <p className="text-xs text-slate-500">{selectedTemplate.purpose}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="title">
                                            Title <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="title" name="title" defaultValue={page?.title ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.title)} />
                                        {errors.title && <p className={fieldErrorClass}>{errors.title}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="slug">
                                            Slug <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="slug" name="slug" defaultValue={page?.slug ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.slug)} />
                                        {errors.slug && <p className={fieldErrorClass}>{errors.slug}</p>}
                                        <p className="text-xs text-slate-500">
                                            Lowercase letters, numbers and hyphens only. Used in the public URL.
                                        </p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="summary">
                                            Summary{selectedTemplate?.requires_summary && (
                                                <span className="text-fmca-crimson"> *</span>
                                            )}
                                        </Label>
                                        <textarea
                                            id="summary"
                                            name="summary"
                                            defaultValue={page?.summary ?? ''}
                                            rows={2}
                                            maxLength={240}
                                            aria-invalid={Boolean(errors.summary)}
                                            className={textareaClass}
                                        />
                                        {errors.summary && <p className={fieldErrorClass}>{errors.summary}</p>}
                                        <p className="text-xs text-slate-500">Short one-line summary shown under the page title.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="owner">
                                            Content owner{selectedTemplate?.requires_owner && (
                                                <span className="text-fmca-crimson"> *</span>
                                            )}
                                        </Label>
                                        <Input
                                            id="owner"
                                            name="owner"
                                            defaultValue={page?.owner ?? selectedTemplate?.default_owner ?? ''}
                                            maxLength={120}
                                            className="h-11"
                                            aria-invalid={Boolean(errors.owner)}
                                        />
                                        {errors.owner && <p className={fieldErrorClass}>{errors.owner}</p>}
                                        <p className="text-xs text-slate-500">Use the team or desk name, not a single clinician.</p>
                                    </div>

                                    <div className="border-t border-fmca-ink/10 pt-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Content blocks</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Blocks are written as JSON — rich text blocks use the visual
                                                    editor — and only rendered by the public page when published. At
                                                    least one block is required.
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <select
                                                    value={newBlockKey}
                                                    onChange={(event) => setNewBlockKey(event.target.value)}
                                                    className={`h-10 w-44 rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40 ${
                                                        addableKeys.length === 0 ? 'opacity-50' : ''
                                                    }`}
                                                >
                                                    <option value="">Add a block…</option>
                                                    {addableKeys.map((key) => (
                                                        <option key={key} value={key}>
                                                            {labelFor(key)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    type="button"
                                                    onClick={addBlock}
                                                    disabled={!newBlockKey}
                                                    className="h-10 gap-1.5 bg-fmca-green text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                                >
                                                    <Plus size={16} aria-hidden="true" />
                                                    <span>Add</span>
                                                </Button>
                                            </div>
                                        </div>
                                        {errors.blocks && <p className={`mt-2 ${fieldErrorClass}`}>{errors.blocks}</p>}

                                        <div className="mt-4 grid gap-4">
                                            {blocks.map((block, index) => {
                                                const permitted = permittedKeys.includes(block.key);
                                                const contentError = errors[`blocks.${index}.content`];
                                                const keyError = errors[`blocks.${index}.block_key`];

                                                return (
                                                    <div
                                                        key={`${block.key}-${index}`}
                                                        className="rounded-lg border border-fmca-ink/10 bg-fmca-mist/30 p-4"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <span className="text-sm font-bold text-fmca-green-dark">
                                                                {labelFor(block.key)}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeBlock(index)}
                                                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-fmca-crimson transition-colors hover:bg-fmca-crimson/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                                            >
                                                                <Trash2 size={13} aria-hidden="true" />
                                                                Remove
                                                            </button>
                                                        </div>
                                                        {!permitted && (
                                                            <p className="mt-2 text-xs font-bold text-fmca-crimson">
                                                                This block type is not allowed on the selected template.
                                                            </p>
                                                        )}
                                                        <input type="hidden" name={`blocks.${index}.block_key`} value={block.key} />
                                                        {block.key === 'rich_text' ? (
                                                            <RichTextBlockEditor
                                                                index={index}
                                                                initialJson={block.json}
                                                                error={contentError || keyError}
                                                            />
                                                        ) : (
                                                            <>
                                                                <textarea
                                                                    name={`blocks.${index}.content`}
                                                                    defaultValue={block.json}
                                                                    rows={6}
                                                                    aria-invalid={Boolean(contentError || keyError)}
                                                                    className={`mt-3 ${textareaClass} ${contentError || keyError ? 'border-fmca-crimson' : ''}`}
                                                                />
                                                                <details className="mt-2">
                                                                    <summary className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-700">
                                                                        Expected JSON shape
                                                                    </summary>
                                                                    <pre className="mt-2 overflow-x-auto rounded-md bg-fmca-mist p-3 font-mono text-xs text-slate-700">
                                                                        {blockCatalog.find((entry) => entry.key === block.key)?.placeholder ?? '{}'}
                                                                    </pre>
                                                                </details>
                                                                {keyError && <p className={`mt-2 ${fieldErrorClass}`}>{keyError}</p>}
                                                                {contentError && <p className={`mt-2 ${fieldErrorClass}`}>{contentError}</p>}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="status">Publication status</Label>
                                            <select
                                                id="status"
                                                name="status"
                                                defaultValue={page?.status ?? 'draft'}
                                                className={selectClass}
                                                aria-invalid={Boolean(errors.status)}
                                            >
                                                <option value="draft">Draft (hidden from the public site)</option>
                                                <option value="review">In review (awaiting approval)</option>
                                                <option value="published">Published (visible on the public site)</option>
                                            </select>
                                            {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
                                            <p className="text-xs text-slate-500">
                                                Publishing is only available to staff with the publish pages right.
                                            </p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="reviewed_at">Last reviewed date</Label>
                                            <input
                                                id="reviewed_at"
                                                name="reviewed_at"
                                                type="date"
                                                defaultValue={page?.reviewed_at ? String(page.reviewed_at).slice(0, 10) : ''}
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
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create page'}
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
