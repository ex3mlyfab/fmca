import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import cmsRedirects from '@/routes/cms/redirects';

type Redirect = {
    id?: number;
    from_path: string;
    to_path: string;
    status_code: number;
    is_active: boolean;
} | null;

type Props = {
    redirect: Redirect;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function RedirectEditor({ redirect }: Props) {
    const isEditing = Boolean(redirect?.id);

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} redirect | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsRedirects.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            URL redirects
                        </Link>
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit redirect' : 'New redirect'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        When someone visits the old address, the site sends them to the new one. Paused redirects are
                        stored but not applied.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsRedirects.update.url(redirect!.id!) : cmsRedirects.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="from_path">
                                            Old address <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input
                                            id="from_path"
                                            name="from_path"
                                            defaultValue={redirect?.from_path ?? ''}
                                            maxLength={255}
                                            placeholder="/old-service-name"
                                            className="h-11"
                                            aria-invalid={Boolean(errors.from_path)}
                                        />
                                        {errors.from_path && <p className={fieldErrorClass}>{errors.from_path}</p>}
                                        <p className="text-xs text-slate-500">Starts with a slash. Example: /cardiology-clinic</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="to_path">
                                            New address <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input
                                            id="to_path"
                                            name="to_path"
                                            defaultValue={redirect?.to_path ?? ''}
                                            maxLength={2048}
                                            placeholder="/services/cardiology"
                                            className="h-11"
                                            aria-invalid={Boolean(errors.to_path)}
                                        />
                                        {errors.to_path && <p className={fieldErrorClass}>{errors.to_path}</p>}
                                        <p className="text-xs text-slate-500">Where the old address should send visitors.</p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="status_code">Redirect type</Label>
                                            <select id="status_code" name="status_code" defaultValue={redirect?.status_code ?? 301} className={selectClass}>
                                                <option value={301}>Permanent (301)</option>
                                                <option value={302}>Temporary (302)</option>
                                            </select>
                                        </div>

                                        <div className="grid content-start gap-2">
                                            <label htmlFor="is_active" className="flex items-center gap-2 text-sm font-bold text-fmca-ink">
                                                <input
                                                    id="is_active"
                                                    name="is_active"
                                                    type="checkbox"
                                                    value="1"
                                                    defaultChecked={redirect ? redirect.is_active : true}
                                                    className="size-4 rounded border-input accent-fmca-green"
                                                />
                                                Active
                                            </label>
                                            <p className="text-xs text-slate-500">Uncheck to store the redirect without applying it.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create redirect'}
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
