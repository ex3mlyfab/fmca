import { AlertTriangle, PhoneCall } from 'lucide-react';

export type EmergencyHotbarProps = {
    message?: string;
    phone?: string;
    phoneLabel?: string;
};

export function EmergencyHotbar({
    message = 'Clinical emergency triage is active. For life-threatening emergencies, dispatch or visit directly.',
    phone = '+2340000000000',
    phoneLabel = 'Emergency dispatch call',
}: EmergencyHotbarProps) {
    return (
        <section className="border-b border-fmca-ink/10 bg-fmca-crimson px-4 py-3 text-white sm:px-6" aria-label="Emergency triage notification">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm">
                <p className="flex items-center gap-2.5 font-medium leading-normal">
                    <span className="flex size-2 shrink-0 rounded-full bg-white" aria-hidden="true" />
                    <AlertTriangle size={17} className="shrink-0 text-white" aria-hidden="true" />
                    <span>{message}</span>
                </p>
                <a
                    href={`tel:${phone}`}
                    className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-fmca-crimson shadow-sm transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white"
                >
                    <PhoneCall size={16} aria-hidden="true" />
                    <span>{phoneLabel}</span>
                </a>
            </div>
        </section>
    );
}
