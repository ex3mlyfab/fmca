import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsDocuments from '@/routes/cms/documents';

type Document = {
    id?: number;
    title: string;
    summary?: string | null;
    fileName?: string | null;
    issuingUnit?: string | null;
    issueDate?: string | null;
    owner?: string | null;
    reviewedAt?: string | null;
    status: string;
} | null;

type Props = {
    document: Document;
    canPublish: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const fileInputClass =
    'h-11 w-full cursor-pointer rounded-md border border-dashed border-fmca-ink/25 bg-white px-3 text-sm text-slate-600 file:ml-3 file:border-0 file:bg-fmca-mist file:px-3 file:py-2 file:text-xs file:font-bold file:text-fmca-green dark:bg-transparent file:dark:bg-transparent focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function DocumentEditor({ document, canPublish }: Props) {
    const isEditing = Boolean(document?.id);
    const canSetStatus = canPublish || document?.status === 'published';

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} document | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsDocuments.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Documents
                        </Link>
                        {document && <StatusChip status={document.status} />}
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit document' : 'New document'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Documents are only downloadable on the public site while
                        published.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsDocuments.update.url(document!.id!) : cmsDocuments.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="document-title">
                                            Title <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="document-title" name="title" defaultValue={document?.title ?? ''} maxLength={160} className="h-11" aria-invalid={Boolean(errors.title)} />
                                        {errors.title && <p className={fieldErrorClass}>{errors.title}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="document-summary">Summary</Label>
                                        <textarea
                                            id="document-summary"
                                            name="summary"
                                            defaultValue={document?.summary ?? ''}
                                            rows={3}
                                            maxLength={500}
                                            aria-invalid={Boolean(errors.summary)}
                                            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40"
                                        />
                                        {errors.summary && <p className={fieldErrorClass}>{errors.summary}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="document-file">
                                            File {isEditing ? '' : <span className="text-fmca-crimson">*</span>}
                                        </Label>
                                        {isEditing && document?.fileName && (
                                            <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <FileText size={13} aria-hidden="true" />
                                                Current file: {document.fileName}. Choosing a new file replaces it.
                                            </p>
                                        )}
                                        <input
                                            id="document-file"
                                            name="file"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt"
                                            required={!isEditing}
                                            className={fileInputClass}
                                            aria-invalid={Boolean(errors.file)}
                                        />
                                        {errors.file && <p className={fieldErrorClass}>{errors.file}</p>}
                                        <p className="text-xs text-slate-500">PDF, Word, or plain text · 10 MB max.</p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="document-issuing-unit">Issuing unit</Label>
                                            <Input id="document-issuing-unit" name="issuing_unit" defaultValue={document?.issuingUnit ?? ''} maxLength={120} className="h-11" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="document-issue-date">Issue date</Label>
                                            <input
                                                id="document-issue-date"
                                                name="issue_date"
                                                type="date"
                                                defaultValue={document?.issueDate ?? ''}
                                                className={selectClass}
                                                aria-invalid={Boolean(errors.issue_date)}
                                            />
                                            {errors.issue_date && <p className={fieldErrorClass}>{errors.issue_date}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="document-owner">Content owner</Label>
                                            <Input id="document-owner" name="owner" defaultValue={document?.owner ?? ''} maxLength={120} className="h-11" />
                                            <p className="text-xs text-slate-500">Use the team or desk name, not a single person.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="document-reviewed">Last reviewed</Label>
                                            <input
                                                id="document-reviewed"
                                                name="reviewed_at"
                                                type="date"
                                                defaultValue={document?.reviewedAt ?? ''}
                                                className={selectClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="document-status">Publication status</Label>
                                        <select
                                            id="document-status"
                                            name="status"
                                            defaultValue={document?.status ?? 'draft'}
                                            className={selectClass}
                                            aria-invalid={Boolean(errors.status)}
                                        >
                                            <option value="draft">Draft (hidden from the public site)</option>
                                            {(canPublish || document?.status === 'published') && (
                                                <option value="published">Published (downloadable on the public site)</option>
                                            )}
                                        </select>
                                        {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
                                        {!canSetStatus && (
                                            <p className="text-xs text-slate-500">Publishing is only available to staff with the publish documents right.</p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create document'}
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
