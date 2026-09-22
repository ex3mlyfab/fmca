import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsCommittees from '@/routes/cms/committees';
import publicAbout from '@/routes/about';

type Member = {
    id?: number;
    name: string;
    slug: string;
    role: string;
    portfolio?: string | null;
    mandate?: string | null;
    term?: string | null;
    sort_order?: number | null;
    portrait?: string | null;
    owner?: string | null;
    reviewed_at?: string | null;
    status: string;
} | null;

type Props = {
    member: Member;
    canPublish: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function CommitteeMemberEditor({ member, canPublish }: Props) {
    const isEditing = Boolean(member?.id);
    const canSetStatus = canPublish || member?.status === 'published';

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} committee member | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsCommittees.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Top Management Committee
                        </Link>
                        {member && <StatusChip status={member.status} />}
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit committee member' : 'New committee member'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Members are public only after they are approved and published.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsCommittees.update.url(member!.id!) : cmsCommittees.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="name">
                                                Member name <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <Input id="name" name="name" defaultValue={member?.name ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.name)} />
                                            {errors.name && <p className={fieldErrorClass}>{errors.name}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="role">
                                                Role / title <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <Input id="role" name="role" defaultValue={member?.role ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.role)} />
                                            {errors.role && <p className={fieldErrorClass}>{errors.role}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="slug">
                                            URL slug <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="slug" name="slug" defaultValue={member?.slug ?? ''} maxLength={160} className="h-11" aria-invalid={Boolean(errors.slug)} />
                                        {errors.slug && <p className={fieldErrorClass}>{errors.slug}</p>}
                                        <p className="text-xs text-slate-500">
                                            Lowercase letters, numbers and hyphens only. Used as the member identifier.
                                        </p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="portfolio">Portfolio / area of responsibility</Label>
                                            <Input id="portfolio" name="portfolio" defaultValue={member?.portfolio ?? ''} maxLength={120} className="h-11" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="term">Term of office</Label>
                                            <Input id="term" name="term" defaultValue={member?.term ?? ''} maxLength={60} className="h-11" placeholder="e.g. 2025 to 2028" />
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="sort_order">Sort order</Label>
                                            <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={member?.sort_order ?? 0} className="h-11" aria-invalid={Boolean(errors.sort_order)} />
                                            {errors.sort_order && <p className={fieldErrorClass}>{errors.sort_order}</p>}
                                            <p className="text-xs text-slate-500">Lower numbers appear first on the public page.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="portrait">Portrait URL</Label>
                                            <Input id="portrait" name="portrait" defaultValue={member?.portrait ?? ''} maxLength={255} className="h-11" aria-invalid={Boolean(errors.portrait)} />
                                            <p className="text-xs text-slate-500">Image URL for the member portrait.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="mandate">Mandate / responsibilities</Label>
                                        <textarea
                                            id="mandate"
                                            name="mandate"
                                            defaultValue={member?.mandate ?? ''}
                                            rows={4}
                                            aria-invalid={Boolean(errors.mandate)}
                                            className={textareaClass}
                                        />
                                        {errors.mandate && <p className={fieldErrorClass}>{errors.mandate}</p>}
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="owner">Content owner</Label>
                                            <Input id="owner" name="owner" defaultValue={member?.owner ?? ''} maxLength={120} className="h-11" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="reviewed_at">Last reviewed</Label>
                                            <Input id="reviewed_at" name="reviewed_at" type="date" defaultValue={member?.reviewed_at ?? ''} className="h-11" aria-invalid={Boolean(errors.reviewed_at)} />
                                            {errors.reviewed_at && <p className={fieldErrorClass}>{errors.reviewed_at}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="member-status">Publication status</Label>
                                        <select
                                            id="member-status"
                                            name="status"
                                            defaultValue={member?.status ?? 'draft'}
                                            aria-invalid={Boolean(errors.status)}
                                            className={selectClass}
                                        >
                                            <option value="draft">Draft (hidden from public site)</option>
                                            {canSetStatus && <option value="published">Published (visible publicly)</option>}
                                        </select>
                                        {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create committee member'}
                                        </Button>
                                        {recentlySuccessful && (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                <CheckCircle2 size={16} aria-hidden="true" />
                                                Saved successfully.
                                            </span>
                                        )}
                                        {isEditing && (
                                            <a
                                                href={publicAbout.leadership().url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green hover:text-fmca-green-dark"
                                            >
                                                <span>View public page</span>
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                            </a>
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
