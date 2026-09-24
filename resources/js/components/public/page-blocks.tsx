import { ArrowUpRight, FileText, Info, MapPin, MessageSquare, Phone, ShieldAlert } from 'lucide-react';

import { contactCards, visitingPolicyNote, visitingSlots, type ContactCard } from '@/lib/contact-info';

export type PageBlockContent = {
    heading?: string;
    title?: string;
    body?: string;
    tone?: string;
    label?: string;
    href?: string;
    note?: string;
    steps?: { title?: string; body?: string }[];
    items?: { question?: string; answer?: string }[];
    documents?: { label?: string; href?: string; note?: string }[];
};

export type PageBlockData = {
    block_key: string;
    content: PageBlockContent | null;
    sort_order: number;
};

export function PageBlockView({ block }: { block: PageBlockData }) {
    switch (block.block_key) {
        case 'rich_text':
            return <RichTextBlock content={block.content} />;
        case 'steps':
            return <StepsBlock content={block.content} />;
        case 'alert':
            return <AlertBlock content={block.content} />;
        case 'faq':
            return <FaqBlock content={block.content} />;
        case 'document_list':
            return <DocumentListBlock content={block.content} />;
        case 'cta':
            return <CtaBlock content={block.content} />;
        case 'contact_panel':
            return <ContactPanelBlock content={block.content} />;
        default:
            return null;
    }
}

function RichTextBlock({ content }: { content: PageBlockContent | null }) {
    if (!content?.body && !content?.heading) {
        return null;
    }

    const body = (content?.body ?? '').trim();
    const isHtml = /^<[^>\s]/.test(body);

    return (
        <section className="space-y-4">
            {content?.heading && (
                <h2 className="font-display text-2xl font-bold text-fmca-green-dark">{content.heading}</h2>
            )}
            {isHtml ? (
                // Stored HTML is sanitized server-side (App\Support\BlockContentSanitizer)
                // before it reaches the database; the editor's SafeLink extension keeps
                // link targets internal or http(s) on the way in as well.
                <div className="fmca-prose max-w-[65ch]" dangerouslySetInnerHTML={{ __html: body }} />
            ) : body ? (
                <div className="max-w-[65ch]">
                    {body
                        .split('\n')
                        .filter((line) => line.trim() !== '')
                        .map((paragraph, index) => (
                            <p key={index} className="mb-3 text-base leading-relaxed text-slate-700 last:mb-0">
                                {paragraph}
                            </p>
                        ))}
                </div>
            ) : null}
        </section>
    );
}

function StepsBlock({ content }: { content: PageBlockContent | null }) {
    const steps = content?.steps ?? [];

    if (steps.length === 0) {
        return null;
    }

    return (
        <section aria-label={content?.title ?? 'Steps'} className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs">
            {content?.title && (
                <h2 className="font-display text-xl font-bold text-fmca-green-dark">{content.title}</h2>
            )}
            <ol className="mt-5 space-y-5">
                {steps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fmca-green text-sm font-bold text-white">
                            {index + 1}
                        </span>
                        <div>
                            {step.title && <h3 className="text-sm font-bold text-fmca-ink">{step.title}</h3>}
                            {step.body && <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>}
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function AlertBlock({ content }: { content: PageBlockContent | null }) {
    if (!content?.body && !content?.title) {
        return null;
    }

    const important = content?.tone === 'important';

    return (
        <aside
            role="note"
            className={`flex items-start gap-3 rounded-xl border p-4 sm:p-5 ${
                important
                    ? 'border-fmca-crimson/25 bg-fmca-crimson/5 text-fmca-crimson'
                    : 'border-fmca-sky/30 bg-fmca-sky/5 text-fmca-sky-dark'
            }`}
        >
            {important ? (
                <ShieldAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            ) : (
                <Info size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            )}
            <div>
                {content?.title && <h2 className="text-sm font-bold">{content.title}</h2>}
                {content?.body && <p className="mt-1 text-sm leading-relaxed">{content.body}</p>}
            </div>
        </aside>
    );
}

function FaqBlock({ content }: { content: PageBlockContent | null }) {
    const items = content?.items ?? [];

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs">
            {content?.title && (
                <h2 className="font-display text-xl font-bold text-fmca-green-dark">{content.title}</h2>
            )}
            <div className="mt-4 divide-y divide-fmca-ink/10">
                {items.map((item, index) => (
                    <details key={index} className="group py-4 first:pt-0 last:pb-0">
                        <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-bold text-fmca-ink">
                            <span>{item.question}</span>
                            <span aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-45">
                                +
                            </span>
                        </summary>
                        {item.answer && (
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                        )}
                    </details>
                ))}
            </div>
        </section>
    );
}

function DocumentListBlock({ content }: { content: PageBlockContent | null }) {
    const documents = content?.documents ?? [];

    if (documents.length === 0) {
        return null;
    }

    const isExternal = (href: string) => /^https?:\/\//.test(href);

    return (
        <section className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs">
            {content?.title && (
                <h2 className="font-display text-xl font-bold text-fmca-green-dark">{content.title}</h2>
            )}
            <ul className="mt-4 space-y-2">
                {documents.map((document, index) => (
                    <li key={index}>
                        <a
                            href={document.href}
                            {...(isExternal(document.href ?? '')
                                ? { target: '_blank', rel: 'noreferrer' }
                                : {})}
                            className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-fmca-mist hover:text-fmca-green focus-visible:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <span className="flex items-center gap-2.5">
                                <FileText size={17} className="shrink-0 text-fmca-teal" aria-hidden="true" />
                                <span>
                                    {document.label}
                                    {document.note && (
                                        <span className="ml-2 text-xs font-medium text-slate-500">{document.note}</span>
                                    )}
                                </span>
                            </span>
                            <ArrowUpRight
                                size={15}
                                className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-fmca-green"
                                aria-hidden="true"
                            />
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function CtaBlock({ content }: { content: PageBlockContent | null }) {
    if (!content?.label || !content?.href) {
        return null;
    }

    const external = /^https?:\/\//.test(content.href);

    return (
        <div className="flex flex-wrap gap-3">
            <a
                href={content.href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
            >
                {content.label}
                <ArrowUpRight size={16} aria-hidden="true" />
            </a>
        </div>
    );
}

const contactIcons: Record<ContactCard['icon'], typeof MapPin> = {
    pin: MapPin,
    phone: Phone,
    message: MessageSquare,
};

function ContactPanelBlock({ content }: { content: PageBlockContent | null }) {
    return (
        <section className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs">
            <h2 className="font-display text-xl font-bold text-fmca-green-dark">{content?.title ?? 'How to reach us'}</h2>
            {content?.note && (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{content.note}</p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-1">
                {contactCards.map((card) => {
                    const Icon = contactIcons[card.icon];
                    return (
                        <div key={card.title} className="rounded-lg border border-fmca-ink/10 bg-fmca-mist/50 p-4">
                            <div className="flex items-center gap-2.5">
                                <Icon size={18} className="text-fmca-teal" aria-hidden="true" />
                                <h3 className="text-sm font-bold text-fmca-ink">{card.title}</h3>
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                                {card.description.join(' ')}
                            </p>
                            <a
                                href={card.href}
                                {...(card.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                                className="mt-2 inline-block text-xs font-bold text-fmca-green hover:text-fmca-green-dark"
                            >
                                {card.hrefLabel}
                            </a>
                        </div>
                    );
                })}
            </div>

            <div className="mt-5 rounded-lg border border-fmca-ink/10 p-4">
                <h3 className="text-sm font-bold text-fmca-ink">Ward visiting schedule</h3>
                <div className="mt-3 divide-y divide-fmca-ink/10 text-xs sm:text-sm">
                    {visitingSlots.map((slot) => (
                        <div key={slot.dayRange} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between font-semibold text-slate-800">
                                <span>{slot.dayRange}</span>
                                <span className="rounded-sm bg-fmca-mist px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                    {slot.status}
                                </span>
                            </div>
                            <div className="mt-1.5 grid grid-cols-2 gap-2 text-slate-600">
                                <div>
                                    <span className="block text-[11px] text-slate-400">Morning:</span>
                                    <span className="font-medium text-slate-700">{slot.morningSlot}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] text-slate-400">Evening:</span>
                                    <span className="font-medium text-slate-700">{slot.eveningSlot}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{visitingPolicyNote}</p>
            </div>
        </section>
    );
}
