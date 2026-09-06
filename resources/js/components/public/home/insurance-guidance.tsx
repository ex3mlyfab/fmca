import { ArrowRight, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type InsuranceGuidanceProps = {
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
};

export function InsuranceGuidance({
    title = 'Need assistance navigating NHIA health insurance?',
    description = 'The FMCA National Health Insurance Authority (NHIA) desk provides registration verification and referral processing. Please review documentation guidelines before your appointment.',
    ctaLabel = 'Request NHIA support guidance',
    ctaHref = '#request',
}: InsuranceGuidanceProps) {
    return (
        <section id="about" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="insurance-heading">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
                {/* Left Informational Column */}
                <div className="flex flex-col justify-between lg:col-span-7">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-bold text-fmca-gold">
                            <ShieldCheck size={15} aria-hidden="true" />
                            <span>National Health Insurance Authority (NHIA) Desk</span>
                        </div>
                        <h2 id="insurance-heading" className="mt-3 font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl lg:text-4xl">
                            {title}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {description}
                        </p>
                    </div>

                    <div className="mt-7">
                        <Button asChild className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark">
                            <a href={ctaHref}>
                                {ctaLabel}
                                <ArrowRight size={17} className="ml-1" />
                            </a>
                        </Button>
                        <p className="mt-3 text-xs text-slate-500">
                            *Note: Administrative guidance pathway only. Formal eligibility is confirmed in-person at the FMCA NHIA verification desk.
                        </p>
                    </div>
                </div>

                {/* Right Required Documents Card */}
                <Card className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-6 shadow-none sm:p-8 lg:col-span-5">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-white text-fmca-gold shadow-xs border border-fmca-ink/5">
                            <FileCheck2 size={22} aria-hidden="true" />
                        </span>
                        <h3 className="font-display text-lg font-bold text-fmca-ink">
                            What to bring to the desk
                        </h3>
                    </div>
                    <ul className="mt-5 space-y-3.5 text-xs sm:text-sm text-slate-700">
                        <li className="flex items-start gap-2.5">
                            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-fmca-green" aria-hidden="true" />
                            <span>Valid NHIA ID card or verifiable Health Maintenance Organization (HMO) number</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-fmca-green" aria-hidden="true" />
                            <span>Formal clinical referral slip from an accredited primary healthcare facility</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-fmca-green" aria-hidden="true" />
                            <span>Government-issued identification (National ID card, Driver License or Voters Card)</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </section>
    );
}
