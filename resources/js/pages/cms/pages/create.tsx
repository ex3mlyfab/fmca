import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Globe, Lock } from 'lucide-react';
import cmsPages from '@/routes/cms/pages';

export type TemplateOption = {
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

export type BlockCatalogEntry = {
    key: string;
    label: string;
    placeholder: string;
};

type Props = {
    templates: TemplateOption[];
    blockCatalog: BlockCatalogEntry[];
};

export default function PagesCreate({ templates, blockCatalog }: Props) {
    const labelFor = (key: string) => blockCatalog.find((entry) => entry.key === key)?.label ?? key;

    return (
        <>
            <Head title="New page | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsPages.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Pages
                        </Link>
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">Choose a page template</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        Each template defines the page's purpose, which content blocks it allows, and whether it gets a
                        public URL. You can change the template later while editing.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {templates.map((template) => (
                            <Link
                                key={template.id}
                                href={cmsPages.start({ query: { template: template.key } })}
                                as="button"
                                className="group flex flex-col rounded-xl border border-fmca-ink/10 bg-white p-5 text-left shadow-xs transition-colors hover:border-fmca-green/40 hover:bg-fmca-mist/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="font-display text-lg font-bold text-fmca-green-dark">{template.name}</h2>
                                    {template.routable ? (
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-fmca-sky/10 px-2 py-0.5 text-[11px] font-bold text-fmca-sky-dark">
                                            <Globe size={13} aria-hidden="true" />
                                            Public
                                        </span>
                                    ) : (
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-fmca-ink/5 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                                            <Lock size={13} aria-hidden="true" />
                                            Internal
                                        </span>
                                    )}
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{template.purpose}</p>

                                <div className="mt-3 text-xs font-semibold text-slate-500">
                                    {template.routable && template.url_prefix
                                        ? `Public path: /${template.url_prefix}/{slug}`
                                        : 'Not publicly routable yet'}
                                    {template.requires_owner ? ' · Requires content owner' : ''}
                                    {template.requires_summary ? ' · Requires summary' : ''}
                                </div>

                                {template.default_owner && (
                                    <p className="mt-1 text-xs text-slate-500">Default owner: {template.default_owner}</p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {template.permitted_blocks.map((key) => (
                                        <span
                                            key={key}
                                            className="rounded-sm bg-fmca-mist px-2 py-0.5 text-[11px] font-bold text-slate-600"
                                        >
                                            {labelFor(key)}
                                        </span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
