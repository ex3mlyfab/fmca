import { Siren } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ContactCards } from '@/components/public/contact-cards';
import { VisitingHoursTable } from '@/components/public/visiting-hours';
import type { ResolvedSiteInfo } from '@/lib/site-info';

/**
 * Contact details and visiting hours, all resolved from the CMS institute
 * profile with the built-in contact constants as fallback.
 */
export function ContactSection({ siteInfo }: { siteInfo: ResolvedSiteInfo }) {
    return (
        <section className="bg-fmca-mist px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="about-contact-heading">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Contact</p>
                <h2 id="about-contact-heading" className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">
                    Contact details
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                    Enquiries, dispatch and visiting arrangements for patients, families and referring teams.
                </p>

                <div className="mt-6 flex items-start gap-2 rounded-lg border border-fmca-crimson/20 bg-fmca-crimson/5 p-3.5 text-xs text-fmca-crimson sm:text-sm">
                    <Siren size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                        For urgent medical assistance, use the {siteInfo.emergencyLabel.toLowerCase()}{' '}
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
                    <Card className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <VisitingHoursTable slots={siteInfo.visitingHours} note={siteInfo.visitingPolicyNote} />
                    </Card>

                    <Card className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <h3 className="font-display text-xl font-bold text-fmca-green-dark">Keeping this page accurate</h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            Campus access, contact details and visiting arrangements are reviewed by the institute's communications
                            and clinical desks. Tell them when something has changed.
                        </p>
                        <p className="mt-5 border-t border-fmca-ink/10 pt-4 text-xs text-slate-500">
                            Last reviewed by {siteInfo.contentOwner} · {siteInfo.reviewedAt}.
                        </p>
                    </Card>
                </div>
            </div>
        </section>
    );
}
