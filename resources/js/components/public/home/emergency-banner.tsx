import { AlertOctagon, PhoneCall } from 'lucide-react';
import { useSiteInfo } from '@/lib/site-info';

export type EmergencyBannerProps = {
    title?: string;
    description?: string;
    phone?: string;
    phoneLabel?: string;
};

export function EmergencyBanner({
    title = 'Need immediate emergency medical intervention?',
    description = 'The FMCA accident, emergency and trauma centre operates continuous 24-hour consultant and clinical team coverage.',
    phone,
    phoneLabel = 'Call emergency dispatch',
}: EmergencyBannerProps) {
    const siteInfo = useSiteInfo();
    const resolvedPhone = phone ?? siteInfo.emergencyPhone;

    return (
        <section id="request" className="bg-fmca-crimson px-4 py-12 text-white sm:px-6" aria-labelledby="emergency-banner-heading">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-100">
                        <AlertOctagon size={16} aria-hidden="true" />
                        <span>24/7 Trauma and Emergency Dispatch</span>
                    </div>
                    <h2 id="emergency-banner-heading" className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                        {title}
                    </h2>
                    <p className="mt-2 text-sm text-white/90 sm:text-base">
                        {description}
                    </p>
                </div>

                <a
                    href={`tel:${resolvedPhone}`}
                    className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-md bg-white px-7 text-base font-bold text-fmca-crimson shadow-md transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-white"
                >
                    <PhoneCall size={20} aria-hidden="true" />
                    <span>{phoneLabel}</span>
                </a>
            </div>
        </section>
    );
}
