import { Form, Head } from '@inertiajs/react';
import { CalendarPlus, CheckCircle2 } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import appointmentsStore from '@/routes/appointments';

type Department = {
    id: number;
    name: string;
};

type Props = {
    departments: Department[];
    submitted: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function Appointments({ departments, submitted }: Props) {
    return (
        <SiteShell>
            <Head title="Request an appointment | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Outpatient clinic</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">Request an appointment</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            Submit an outpatient clinic request and our desk will follow up with you. This is a request, not a
                            confirmed booking — we will contact you to confirm availability and timing.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
                    {submitted ? (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-fmca-ink/10 bg-white p-10 text-center shadow-xs">
                            <span className="flex size-14 items-center justify-center rounded-full bg-fmca-mist text-fmca-green">
                                <CheckCircle2 size={28} aria-hidden="true" />
                            </span>
                            <h2 className="font-display text-xl font-bold text-fmca-green-dark">We've received your request</h2>
                            <p className="max-w-md text-sm leading-relaxed text-slate-600">
                                Our team will follow up with you to confirm availability. Please note this was a request, not a
                                confirmed booking.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                            <Form method="post" action={appointmentsStore.store.url()} resetOnError>
                                {({ errors, processing }) => (
                                    <div className="grid gap-5">
                                        {/* Honeypot: invisible to users, filled by bots, rejected on the server. */}
                                        <div className="hidden">
                                            <label htmlFor="website">Website</label>
                                            <Input id="website" name="website" type="text" />
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="full_name">
                                                Full name <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <Input id="full_name" name="full_name" maxLength={120} className="h-11" aria-invalid={Boolean(errors.full_name)} />
                                            {errors.full_name && <p className={fieldErrorClass}>{errors.full_name}</p>}
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="phone">
                                                    Phone <span className="text-fmca-crimson">*</span>
                                                </Label>
                                                <Input id="phone" name="phone" maxLength={30} className="h-11" aria-invalid={Boolean(errors.phone)} />
                                                {errors.phone && <p className={fieldErrorClass}>{errors.phone}</p>}
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" name="email" type="email" maxLength={190} className="h-11" aria-invalid={Boolean(errors.email)} />
                                                {errors.email && <p className={fieldErrorClass}>{errors.email}</p>}
                                            </div>
                                        </div>

                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="department_id">Preferred department</Label>
                                                <select id="department_id" name="department_id" defaultValue="" className={selectClass}>
                                                    <option value="">No preference</option>
                                                    {departments.map((department) => (
                                                        <option key={department.id} value={department.id}>
                                                            {department.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="preferred_service">Preferred service</Label>
                                                <Input id="preferred_service" name="preferred_service" maxLength={120} className="h-11" />
                                            </div>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="preferred_date">Preferred date</Label>
                                            <Input id="preferred_date" name="preferred_date" type="date" className="h-11" aria-invalid={Boolean(errors.preferred_date)} />
                                            {errors.preferred_date && <p className={fieldErrorClass}>{errors.preferred_date}</p>}
                                            <p className="text-xs text-slate-500">A suggestion only — we will confirm an available time with you.</p>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="reason">Anything you'd like us to know</Label>
                                            <textarea id="reason" name="reason" rows={4} maxLength={2000} className={textareaClass} />
                                        </div>

                                        <div className="grid gap-2">
                                            <label htmlFor="consent" className="flex items-start gap-2.5 text-sm text-slate-700">
                                                <input id="consent" name="consent" type="checkbox" value="1" className="mt-0.5 size-4 accent-fmca-green" />
                                                <span>
                                                    I agree that FMCA may use the details above to contact me about this request.{' '}
                                                    <span className="text-fmca-crimson">*</span>
                                                </span>
                                            </label>
                                            {errors.consent && <p className={fieldErrorClass}>{errors.consent}</p>}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                            >
                                                {processing ? 'Sending…' : 'Submit request'}
                                            </Button>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                                <CalendarPlus size={15} aria-hidden="true" />
                                                A request, never a confirmed booking.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        </div>
                    )}
                </section>
            </main>
        </SiteShell>
    );
}
