import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsConsultants from '@/routes/cms/consultants';
import cmsSeo from '@/routes/cms/seo';
import publicConsultants from '@/routes/consultants';

type DepartmentOption = {
    id: number;
    name: string;
};

type Consultant = {
    id?: number;
    name: string;
    slug: string;
    specialty: string;
    position?: string | null;
    biography?: string | null;
    portrait?: string | null;
    specialty_tags?: string | null;
    department_id?: number | null;
    owner?: string | null;
    reviewed_at?: string | null;
    status: string;
} | null;

type Props = {
    consultant: Consultant;
    departments: DepartmentOption[];
    canPublish: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function ConsultantEditor({ consultant, departments, canPublish }: Props) {
    const isEditing = Boolean(consultant?.id);
    const canSetStatus = canPublish || consultant?.status === 'published';

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} consultant | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsConsultants.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Consultants
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                            {consultant && <StatusChip status={consultant.status} />}
                            {consultant?.id && (
                                <Link
                                    href={cmsSeo.edit.url({ content_type: 'consultant', content_id: consultant.id })}
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
                        {isEditing ? 'Edit consultant profile' : 'New consultant profile'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Profiles are public only after they are approved and published.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsConsultants.update.url(consultant!.id!) : cmsConsultants.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="name">
                                                Consultant name <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <Input id="name" name="name" defaultValue={consultant?.name ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.name)} />
                                            {errors.name && <p className={fieldErrorClass}>{errors.name}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="position">Position / title</Label>
                                            <Input id="position" name="position" defaultValue={consultant?.position ?? ''} maxLength={120} className="h-11" />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="slug">
                                            URL slug <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="slug" name="slug" defaultValue={consultant?.slug ?? ''} maxLength={160} className="h-11" aria-invalid={Boolean(errors.slug)} />
                                        {errors.slug && <p className={fieldErrorClass}>{errors.slug}</p>}
                                        <p className="text-xs text-slate-500">Lowercase letters, numbers and hyphens only. Used in the public URL.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="specialty">
                                            Specialty <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="specialty" name="specialty" defaultValue={consultant?.specialty ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.specialty)} />
                                        {errors.specialty && <p className={fieldErrorClass}>{errors.specialty}</p>}
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="department_id">Department</Label>
                                            <select
                                                id="department_id"
                                                name="department_id"
                                                defaultValue={consultant?.department_id ?? ''}
                                                className={selectClass}
                                            >
                                                <option value="">No department</option>
                                                {departments.map((department) => (
                                                    <option key={department.id} value={department.id}>
                                                        {department.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="specialty_tags">Specialty tags</Label>
                                            <Input
                                                id="specialty_tags"
                                                name="specialty_tags"
                                                defaultValue={consultant?.specialty_tags ?? ''}
                                                maxLength={240}
                                                className="h-11"
                                                placeholder="Cardiology, Hypertension"
                                            />
                                            <p className="text-xs text-slate-500">Separate tags with commas. Shown as focus areas on the profile.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="biography">Biography</Label>
                                        <textarea
                                            id="biography"
                                            name="biography"
                                            defaultValue={consultant?.biography ?? ''}
                                            rows={5}
                                            aria-invalid={Boolean(errors.biography)}
                                            className={textareaClass}
                                        />
                                        {errors.biography && <p className={fieldErrorClass}>{errors.biography}</p>}
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="portrait">Portrait URL</Label>
                                            <Input id="portrait" name="portrait" defaultValue={consultant?.portrait ?? ''} maxLength={255} className="h-11" aria-invalid={Boolean(errors.portrait)} />
                                            <p className="text-xs text-slate-500">Image URL for the profile portrait.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="owner">Content owner</Label>
                                            <Input id="owner" name="owner" defaultValue={consultant?.owner ?? ''} maxLength={120} className="h-11" />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="reviewed_at">Last reviewed</Label>
                                        <Input id="reviewed_at" name="reviewed_at" type="date" defaultValue={consultant?.reviewed_at ?? ''} className="h-11" aria-invalid={Boolean(errors.reviewed_at)} />
                                        {errors.reviewed_at && <p className={fieldErrorClass}>{errors.reviewed_at}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="consultant-status">Publication status</Label>
                                        <select
                                            id="consultant-status"
                                            name="status"
                                            defaultValue={consultant?.status ?? 'draft'}
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
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create consultant'}
                                        </Button>
                                        {recentlySuccessful && (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                <CheckCircle2 size={16} aria-hidden="true" />
                                                Saved successfully.
                                            </span>
                                        )}
                                        {isEditing && (
                                            <a
                                                href={publicConsultants.show.url(consultant!.slug)}
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
