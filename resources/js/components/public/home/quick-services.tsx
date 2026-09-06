import { ArrowRight, CalendarDays, Compass, FileText, HeartPulse, MapPin, ShieldCheck } from 'lucide-react';

export type ServiceItem = {
    title: string;
    description: string;
    href: string;
    icon: typeof Compass;
    isPrimary?: boolean;
};

const defaultServices: ServiceItem[] = [
    {
        title: 'Find a clinical specialty',
        description: 'Explore verified departments, consultant clinics and outpatient services.',
        href: '#services',
        icon: Compass,
        isPrimary: true,
    },
    {
        title: 'Request an appointment',
        description: 'Submit an outpatient clinic request for administrative follow-up.',
        href: '#request',
        icon: CalendarDays,
        isPrimary: true,
    },
    {
        title: 'Campus directions & arrival',
        description: 'Interactive route guidance, parking, and facility accessibility.',
        href: '#visiting',
        icon: MapPin,
        isPrimary: true,
    },
    {
        title: 'Patient admission guides',
        description: 'Key requirements for inpatient admission, visiting policies, and patient rights.',
        href: '#visiting',
        icon: FileText,
        isPrimary: false,
    },
    {
        title: 'NHIA health insurance support',
        description: 'Guidance on national health insurance coverage and desk support.',
        href: '#about',
        icon: ShieldCheck,
        isPrimary: false,
    },
    {
        title: 'Diagnostic & laboratory information',
        description: 'Verified test pathways, sample collection hours, and physician result release.',
        href: '#services',
        icon: HeartPulse,
        isPrimary: false,
    },
];

export type QuickServicesProps = {
    services?: ServiceItem[];
    heading?: string;
    subheading?: string;
};

export function QuickServices({
    services = defaultServices,
    heading = 'What care pathway do you need today?',
    subheading = 'Direct clinical and operational access pathways for patients, families, and referring teams.',
}: QuickServicesProps) {
    const primaryServices = services.filter((s) => s.isPrimary);
    const secondaryServices = services.filter((s) => !s.isPrimary);

    return (
        <section id="services" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="services-heading">
            <div className="max-w-2xl">
                <h2 id="services-heading" className="font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl lg:text-4xl">
                    {heading}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {subheading}
                </p>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-12">
                {/* Primary Immediate Action Cards (High Contrast, 3-Columns Desktop) */}
                <div className="grid gap-5 sm:grid-cols-3 lg:col-span-12">
                    {primaryServices.map(({ title, description, href, icon: Icon }) => (
                        <a
                            key={title}
                            href={href}
                            className="group flex min-h-48 flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-fmca-green/30 hover:shadow-md focus-visible:-translate-y-1"
                        >
                            <div>
                                <span className="flex size-12 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green transition-colors group-hover:bg-fmca-green group-hover:text-white">
                                    <Icon size={24} aria-hidden="true" />
                                </span>
                                <strong className="mt-4 block font-display text-lg font-bold text-fmca-green-dark">
                                    {title}
                                </strong>
                                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                    {description}
                                </p>
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-fmca-green">
                                <span>Access service</span>
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </div>
                        </a>
                    ))}
                </div>

                {/* Secondary Guidance Pathways (Clean Bordered Horizontal List) */}
                <div className="grid gap-4 sm:grid-cols-3 lg:col-span-12">
                    {secondaryServices.map(({ title, description, href, icon: Icon }) => (
                        <a
                            key={title}
                            href={href}
                            className="group flex items-start gap-4 rounded-lg border border-fmca-ink/10 bg-[#FAFBFB] p-5 transition-colors hover:border-fmca-green/30 hover:bg-white"
                        >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-fmca-teal shadow-xs border border-fmca-ink/5">
                                <Icon size={20} aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <strong className="block font-display text-sm font-bold text-fmca-ink group-hover:text-fmca-green">
                                    {title}
                                </strong>
                                <p className="mt-1 text-xs leading-normal text-slate-500 line-clamp-2">
                                    {description}
                                </p>
                            </div>
                            <ArrowRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-fmca-green" aria-hidden="true" />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
