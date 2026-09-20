import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsClinics from '@/routes/cms/clinics';

type DepartmentOption = {
    id: number;
    name: string;
};

type Clinic = {
    id?: number;
    name: string;
    summary?: string | null;
    hours?: string | null;
    department_id?: number | null;
    owner?: string | null;
    reviewed_at?: string | null;
    status: string;
} | null;

type Props = {
    clinic: Clinic;
    departments: DepartmentOption[];
    canPublish: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function ClinicEditor({ clinic, departments, canPublish }: Props) {
    const isEditing = Boolean(clinic?.id);
    const canSetStatus = canPublish || clinic?.status === 'published';

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} clinic | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsClinics.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Clinics
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                            {clinic && <StatusChip status={clinic.status} />}
                        </div>
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit clinic' : 'New clinic'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Unpublished clinics are not shown on the public site.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsClinics.update.url(clinic!.id!) : cmsClinics.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="name">
                                            Clinic name <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="name" name="name" defaultValue={clinic?.name ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.name)} />
                                        {errors.name && <p className={fieldErrorClass}>{errors.name}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="summary">Short summary</Label>
                                        <Input id="summary" name="summary" defaultValue={clinic?.summary ?? ''} maxLength={240} className="h-11" aria-invalid={Boolean(errors.summary)} />
                                        {errors.summary && <p className={fieldErrorClass}>{errors.summary}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="hours">Consultation hours</Label>
                                        <textarea
                                            id="hours"
                                            name="hours"
                                            defaultValue={clinic?.hours ?? ''}
                                            rows={3}
                                            aria-invalid={Boolean(errors.hours)}
                                            className={textareaClass}
                                        />
                                        <p className="text-xs text-slate-500">
                                            Hours are public content. Confirm the current schedule with the unit before publishing.
                                        </p>
                                        {errors.hours && <p className={fieldErrorClass}>{errors.hours}</p>}
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="department_id">Department</Label>
                                            <select
                                                id="department_id"
                                                name="department_id"
                                                defaultValue={clinic?.department_id ?? ''}
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
                                            <Label htmlFor="owner">Content owner</Label>
                                            <Input id="owner" name="owner" defaultValue={clinic?.owner ?? ''} maxLength={120} className="h-11" />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="reviewed_at">Last reviewed</Label>
                                        <Input id="reviewed_at" name="reviewed_at" type="date" defaultValue={clinic?.reviewed_at ?? ''} className="h-11" aria-invalid={Boolean(errors.reviewed_at)} />
                                        {errors.reviewed_at && <p className={fieldErrorClass}>{errors.reviewed_at}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="clinic-status">Publication status</Label>
                                        <select
                                            id="clinic-status"
                                            name="status"
                                            defaultValue={clinic?.status ?? 'draft'}
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
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create clinic'}
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
