import { ArrowRight, Clock3, MapPin, Navigation, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { campus, visitingPolicyNote, visitingSlots } from '@/lib/contact-info';

export type { VisitingHourSlot } from '@/lib/contact-info';

export function CampusAccess() {
    return (
        <section id="visiting" className="border-y border-fmca-ink/10 bg-[#f8fbfa] px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="campus-access-heading">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Campus Access & Wayfinding */}
                    <div className="flex flex-col justify-between rounded-2xl bg-fmca-green-dark p-6 text-white sm:p-8 lg:col-span-6">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                                <Navigation size={16} aria-hidden="true" />
                                <span>Campus Location & Wayfinding</span>
                            </div>
                            <h2 id="campus-access-heading" className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                                Find your way to the FMCA Campus
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
                                Located in the Federal Capital Territory, with dedicated emergency vehicle access, patient drop-off zones, and secure visitor parking.
                            </p>

                            <div className="mt-6 flex items-start gap-3 rounded-lg bg-white/10 p-4 backdrop-blur-xs">
                                <MapPin size={22} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
                                <div className="text-xs sm:text-sm">
                                    <strong className="block font-bold">{campus.name}</strong>
                                    <span className="text-white/80">{campus.addressLine1}</span>
                                    <span className="mt-1 block text-emerald-200">{campus.accessNote}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild className="h-12 bg-white px-5 font-bold text-fmca-green-dark shadow-sm hover:bg-emerald-50">
                                <a href={campus.gpsUrl} target="_blank" rel="noreferrer">
                                    <span>Get GPS directions</span>
                                    <ArrowRight size={16} className="ml-1" aria-hidden="true" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Structured Visiting Hours */}
                    <Card className="rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8 lg:col-span-6">
                        <div className="flex items-center gap-2.5 text-fmca-green">
                            <Clock3 size={20} aria-hidden="true" />
                            <h3 className="font-display text-xl font-bold text-fmca-green-dark">
                                Ward visiting schedule
                            </h3>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                            To ensure clinical recovery and infection prevention, visitor access is maintained according to strict ward timetables.
                        </p>

                        <div className="mt-6 divide-y divide-fmca-ink/10 text-xs sm:text-sm">
                            {visitingSlots.map(({ dayRange, morningSlot, eveningSlot, status }) => (
                                <div key={dayRange} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center justify-between font-semibold text-slate-800">
                                        <span>{dayRange}</span>
                                        <span className="rounded-sm bg-fmca-mist px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                            {status}
                                        </span>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-slate-600">
                                        <div>
                                            <span className="text-[11px] text-slate-400 block">Morning:</span>
                                            <span className="font-medium text-slate-700">{morningSlot}</span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-400 block">Evening:</span>
                                            <span className="font-medium text-slate-700">{eveningSlot}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex items-start gap-2 rounded-lg bg-amber-50/70 border border-amber-200/60 p-3.5 text-xs text-amber-900">
                            <ShieldAlert size={17} className="mt-0.5 shrink-0 text-fmca-gold" aria-hidden="true" />
                            <span>
                                {visitingPolicyNote}
                            </span>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    );
}
