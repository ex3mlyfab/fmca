import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsDepartments from '@/routes/cms/departments';
import cmsSeo from '@/routes/cms/seo';
import publicDepartments from '@/routes/departments';

type Department = {
    id?: number;
    name: string;
    slug: string;
    summary: string;
    description: string;
    contact_phone?: string | null;
    contact_email?: string | null;
    owner?: string | null;
    status: string;
} | null;

type Props = {
    department: Department;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function DepartmentEditor({ department }: Props) {
    const isEditing = Boolean(department?.id);

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} department | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsDepartments.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Departments
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                            {department && <StatusChip status={department.status} />}
                            {department?.id && (
                                <Link
                                    href={cmsSeo.edit.url({ content_type: 'department', content_id: department.id })}
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
                        {isEditing ? 'Edit department' : 'New department'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Unpublished content is not shown on the public site.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsDepartments.update.url(department!.id!) : cmsDepartments.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name">
                                            Department name <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="name" name="name" defaultValue={department?.name ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.name)} />
                                        {errors.name && <p className={fieldErrorClass}>{errors.name}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="slug">
                                            URL slug <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="slug" name="slug" defaultValue={department?.slug ?? ''} maxLength={160} className="h-11" aria-invalid={Boolean(errors.slug)} />
                                        {errors.slug && <p className={fieldErrorClass}>{errors.slug}</p>}
                                        <p className="text-xs text-slate-500">Lowercase letters, numbers and hyphens only. Used in the public URL.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="summary">
                                            Short summary <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="summary" name="summary" defaultValue={department?.summary ?? ''} maxLength={240} className="h-11" aria-invalid={Boolean(errors.summary)} />
                                        {errors.summary && <p className={fieldErrorClass}>{errors.summary}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="description">
                                            Description <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            defaultValue={department?.description ?? ''}
                                            rows={5}
                                            aria-invalid={Boolean(errors.description)}
                                            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40"
                                        />
                                        {errors.description && <p className={fieldErrorClass}>{errors.description}</p>}
                                    </div>

                                    <div className="grid gap-5 border-t border-fmca-ink/10 pt-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="contact_phone">Contact phone</Label>
                                            <Input id="contact_phone" name="contact_phone" defaultValue={department?.contact_phone ?? ''} maxLength={30} className="h-11" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="contact_email">Contact email</Label>
                                            <Input id="contact_email" name="contact_email" type="email" defaultValue={department?.contact_email ?? ''} maxLength={160} className="h-11" aria-invalid={Boolean(errors.contact_email)} />
                                            {errors.contact_email && <p className={fieldErrorClass}>{errors.contact_email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="owner">Content owner</Label>
                                        <Input id="owner" name="owner" defaultValue={department?.owner ?? ''} maxLength={120} className="h-11" />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status">Publication status</Label>
                                        <select id="status" name="status" defaultValue={department?.status ?? 'draft'} className={selectClass}>
                                            <option value="draft">Draft (hidden from public site)</option>
                                            <option value="published">Published (visible publicly)</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create department'}
                                        </Button>
                                        {recentlySuccessful && (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                <CheckCircle2 size={16} aria-hidden="true" />
                                                Saved successfully.
                                            </span>
                                        )}
                                        {isEditing && (
                                            <a
                                                href={publicDepartments.show.url(department!.slug)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green hover:text-fmca-green-dark"
                                            >
                                                <span>Preview public page</span>
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
