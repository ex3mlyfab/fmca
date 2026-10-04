import { Clock3, ShieldAlert } from 'lucide-react';
import type { VisitingHourSlot } from '@/lib/contact-info';

/**
 * Ward visiting schedule, rendered from the managed CMS hours. The policy note
 * is a governance statement, so it always renders as the amber callout.
 */
export function VisitingHoursTable({
    slots,
    intro,
    note,
    compact = false,
}: {
    slots: VisitingHourSlot[];
    intro?: string;
    note?: string;
    /** Smaller heading for use inside a page block. */
    compact?: boolean;
}) {
    return (
        <div>
            {compact ? (
                <h3 className="text-sm font-bold text-fmca-ink">Ward visiting schedule</h3>
            ) : (
                <div className="flex items-center gap-2.5 text-fmca-green">
                    <Clock3 size={20} aria-hidden="true" />
                    <h3 className="font-display text-xl font-bold text-fmca-green-dark">Ward visiting schedule</h3>
                </div>
            )}
            {intro && <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{intro}</p>}

            <div className="mt-5 divide-y divide-fmca-ink/10 text-xs sm:text-sm">
                {slots.map(({ dayRange, morningSlot, eveningSlot, status }) => (
                    <div key={dayRange} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>{dayRange}</span>
                            <span className="rounded-sm bg-fmca-mist px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                {status}
                            </span>
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-2 text-slate-600">
                            <div>
                                <span className="block text-[11px] text-slate-400">Morning:</span>
                                <span className="font-medium text-slate-700">{morningSlot}</span>
                            </div>
                            <div>
                                <span className="block text-[11px] text-slate-400">Evening:</span>
                                <span className="font-medium text-slate-700">{eveningSlot}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {note && (
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                    <ShieldAlert size={17} className="mt-0.5 shrink-0 text-fmca-gold" aria-hidden="true" />
                    <span>{note}</span>
                </div>
            )}
        </div>
    );
}
