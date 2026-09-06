import { Activity, Clock3, ShieldCheck } from 'lucide-react';

export type OperationalStatusStripProps = {
    campusStatus?: string;
    serviceDesk?: string;
    reviewStatus?: string;
};

export function OperationalStatusStrip({
    campusStatus = 'Campus operations: Normal clinical capacity',
    serviceDesk = 'Triage & desk: 24/7 active',
    reviewStatus = 'Verified institutional release',
}: OperationalStatusStripProps) {
    return (
        <section className="border-b border-fmca-ink/10 bg-fmca-mist" aria-label="Campus operational indicators">
            <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-fmca-ink/10 text-xs font-semibold text-slate-700 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-center sm:px-6">
                    <span className="flex size-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                    <Activity size={15} className="shrink-0 text-fmca-green" aria-hidden="true" />
                    <span className="truncate">{campusStatus}</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-center sm:px-6">
                    <Clock3 size={15} className="shrink-0 text-fmca-teal" aria-hidden="true" />
                    <span className="truncate">{serviceDesk}</span>
                </div>
                <div className="flex items-center justify-center gap-2 px-4 py-3 text-center sm:px-6">
                    <ShieldCheck size={15} className="shrink-0 text-fmca-green" aria-hidden="true" />
                    <span className="truncate">{reviewStatus}</span>
                </div>
            </div>
        </section>
    );
}
