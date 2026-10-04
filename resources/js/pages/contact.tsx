import { Form, Head } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, MapPin, Siren } from 'lucide-react';
import { ContactCards } from '@/components/public/contact-cards';
import { SiteShell } from '@/components/public/site-shell';
import { VisitingHoursTable } from '@/components/public/visiting-hours';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteInfo } from '@/lib/site-info';
import contactFeedback from '@/routes/contact/feedback';

type Props = {
    submitted: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function Contact({ submitted }: Props) {
    const siteInfo = useSiteInfo();

    return (
        <SiteShell>
            <Head title="Contact & directions | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Getting to FMCA</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">Contact & directions</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                            Campus access, visiting hours and general enquiries for patients, families and referring teams.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
                    <div className="flex items-start gap-2 rounded-lg border border-fmca-crimson/20 bg-fmca-crimson/5 p-3.5 text-xs text-fmca-crimson sm:text-sm">
                        <Siren size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <span>
                            For urgent medical assistance, use the {siteInfo.emergencyLabel.toLowerCase()}'{' '}
                            <a href={siteInfo.emergencyTel} className="font-bold underline underline-offset-2">
                                call now
                            </a>
                            .
                        </span>
                    </div>

                    <div className="mt-6">
                        <ContactCards cards={siteInfo.contactCards} />
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <Card className="rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                            <div className="flex items-center gap-2.5 text-fmca-green">
                                <MapPin size={20} aria-hidden="true" />
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">Directions</h2>
                            </div>
                            <div className="mt-4 rounded-lg bg-fmca-mist p-4">
                                <strong className="block text-sm font-bold text-fmca-green-dark">{siteInfo.campusName}</strong>
                                <p className="mt-1 text-sm text-slate-700">{siteInfo.addressLines.join(', ')}</p>
                                <p className="mt-2 text-xs text-slate-500">{siteInfo.accessNote}</p>
                            </div>
                            <Button asChild className="mt-5 h-12 bg-fmca-green px-5 font-bold text-white shadow-sm hover:bg-fmca-green-dark">
                                <a href={siteInfo.directionsUrl} target="_blank" rel="noreferrer">
                                    <span>Get GPS directions</span>
                                    <ArrowRight size={16} className="ml-1" aria-hidden="true" />
                                </a>
                            </Button>
                        </Card>

                        <Card className="rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                            <VisitingHoursTable slots={siteInfo.visitingHours} note={siteInfo.visitingPolicyNote} />
                            <p className="mt-4 text-xs text-slate-500">
                                Last reviewed by {siteInfo.contentOwner} · {siteInfo.reviewedAt}.
                            </p>
                        </Card>
                    </div>

                    <div className="mt-10 max-w-3xl">
                        {submitted ? (
                            <div className="flex flex-col items-center gap-4 rounded-2xl border border-fmca-ink/10 bg-white p-10 text-center shadow-xs">
                                <span className="flex size-14 items-center justify-center rounded-full bg-fmca-mist text-fmca-green">
                                    <CheckCircle2 size={28} aria-hidden="true" />
                                </span>
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">Thank you for your feedback</h2>
                                <p className="max-w-md text-sm leading-relaxed text-slate-600">
                                    We've received your message and will respond where appropriate.
                                </p>
                            </div>
                        ) : (
                            <Card id="feedback" className="rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                                <h2 className="font-display text-xl font-bold text-fmca-green-dark">Send feedback</h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    Questions about the site or suggestions for improvement. This is not a clinical or emergency
                                    line.
                                </p>
                                <Form method="post" action={contactFeedback.store.url()} resetOnError>
                                    {({ errors, processing }) => (
                                        <div className="mt-6 grid gap-5">
                                            <div className="hidden">
                                                <label htmlFor="website">Website</label>
                                                <Input id="website" name="website" type="text" />
                                            </div>

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="full_name">
                                                        Your name <span className="text-fmca-crimson">*</span>
                                                    </Label>
                                                    <Input id="full_name" name="full_name" maxLength={120} className="h-11" aria-invalid={Boolean(errors.full_name)} />
                                                    {errors.full_name && <p className={fieldErrorClass}>{errors.full_name}</p>}
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label htmlFor="email">
                                                        Email <span className="text-fmca-crimson">*</span>
                                                    </Label>
                                                    <Input id="email" name="email" type="email" maxLength={190} className="h-11" aria-invalid={Boolean(errors.email)} />
                                                    {errors.email && <p className={fieldErrorClass}>{errors.email}</p>}
                                                </div>
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="subject">Subject</Label>
                                                <Input id="subject" name="subject" maxLength={240} className="h-11" />
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="message">
                                                    Message <span className="text-fmca-crimson">*</span>
                                                </Label>
                                                <textarea id="message" name="message" rows={5} maxLength={5000} aria-invalid={Boolean(errors.message)} className={textareaClass} />
                                                {errors.message && <p className={fieldErrorClass}>{errors.message}</p>}
                                            </div>

                                            <div className="flex items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                                >
                                                    {processing ? 'Sending…' : 'Send feedback'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Form>
                            </Card>
                        )}
                    </div>
                </section>
            </main>
        </SiteShell>
    );
}
