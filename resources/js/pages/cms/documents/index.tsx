import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Download, FileText, Inbox, PencilLine, Plus } from 'lucide-react';
import { StatusChip } from '@/pages/cms/departments';
import cmsDocuments from '@/routes/cms/documents';

type DocumentItem = {
    id: number;
    title: string;
    status: string;
    fileName: string;
    sizeBytes?: number | null;
    issuingUnit?: string | null;
    issueDate?: string | null;
    owner?: string | null;
    reviewedAt?: string | null;
    publicUrl?: string | null;
};

type Props = {
    documents: DocumentItem[];
    canCreate: boolean;
    canPublish: boolean;
};

function formatBytes(size?: number | null): string {
    if (!size) {
        return '';
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(0)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsIndex({ documents, canCreate, canPublish }: Props) {
    return (
        <>
            <Head title="Documents | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Media &amp; Publications</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Publications &amp; documents</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Downloadable documents, policies, and tender notices. Only published documents are
                                visible on the public site; drafts stay hidden until someone with the publish right
                                releases them.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsDocuments.create()}
                                as="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New document
                            </Link>
                        )}
                    </header>

                    {documents.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {documents.map((document) => (
                                <div
                                    key={document.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-fmca-mist text-fmca-teal">
                                            <FileText size={22} aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{document.title}</h2>
                                                <StatusChip status={document.status} />
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                {document.issuingUnit ? `${document.issuingUnit} · ` : ''}
                                                {document.issueDate ? `Issued ${document.issueDate}` : ''}
                                                {document.sizeBytes ? ` · ${formatBytes(document.sizeBytes)}` : ''}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {document.owner ? `${document.owner} · ` : ''}
                                                {document.reviewedAt ? `Reviewed ${document.reviewedAt}` : 'Not yet reviewed'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {document.publicUrl && (
                                            <a
                                                href={document.publicUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                            >
                                                <Download size={15} aria-hidden="true" />
                                                <span>Download</span>
                                            </a>
                                        )}
                                        <Link
                                            href={cmsDocuments.edit(document.id)}
                                            as="button"
                                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <PencilLine size={15} aria-hidden="true" />
                                            <span>Edit</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {canPublish && documents.length > 0 && (
                        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                            <ArrowUpRight size={13} aria-hidden="true" />
                            You can publish or unpublish any document from its edit screen.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
    return (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
            <Inbox className="text-slate-400" size={32} aria-hidden="true" />
            <div>
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No documents yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Documents you add will appear in this list. Only published items are shown to the public.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsDocuments.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Add your first document
                </Link>
            )}
        </div>
    );
}
