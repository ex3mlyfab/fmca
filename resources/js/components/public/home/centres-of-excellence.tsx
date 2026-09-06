import { ArrowRight, Baby, HeartHandshake, Microscope, Stethoscope } from 'lucide-react';
import { Card } from '@/components/ui/card';

export type CentreItem = {
    title: string;
    description: string;
    department: string;
    icon: typeof Stethoscope;
    href: string;
};

const defaultCentres: CentreItem[] = [
    {
        title: 'Maternal, Neonatal & Child Care',
        department: 'Paediatrics & Obstetrics',
        description: 'Comprehensive obstetric care, neonatal intensive care unit (NICU) and maternal emergency pathways.',
        icon: Baby,
        href: '#services',
    },
    {
        title: 'Advanced Surgical Specialties',
        department: 'General & Minimally Invasive Surgery',
        description: 'Consultant-led theatres, laparoscopic procedures, orthopaedic trauma, and urology services.',
        icon: Stethoscope,
        href: '#services',
    },
    {
        title: 'Internal Medicine & Chronic Care',
        department: 'Cardiology, Renal & Endocrinology',
        description: 'Specialist inpatient care, dialysis center, metabolic management, and chronic illness clinics.',
        icon: HeartHandshake,
        href: '#services',
    },
    {
        title: 'Diagnostics & Laboratory Medicine',
        department: 'Radiology & Pathology Services',
        description: 'Modern CT scanning, digital radiography, clinical chemistry, hematology, and blood banking.',
        icon: Microscope,
        href: '#services',
    },
];

export type CentresOfExcellenceProps = {
    centres?: CentreItem[];
    heading?: string;
    subheading?: string;
};

export function CentresOfExcellence({
    centres = defaultCentres,
    heading = 'Centres of clinical excellence',
    subheading = 'Specialized tertiary care divisions led by accredited medical consultants and clinical multidisciplinary teams.',
}: CentresOfExcellenceProps) {
    return (
        <section className="bg-fmca-mist px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="centres-heading">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-xl">
                        <h2 id="centres-heading" className="font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl lg:text-4xl">
                            {heading}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {subheading}
                        </p>
                    </div>
                    <a href="#services" className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-fmca-green hover:text-fmca-green-dark">
                        <span>Explore all clinical directories</span>
                        <ArrowRight size={16} aria-hidden="true" />
                    </a>
                </div>

                <div className="mt-8 grid snap-x grid-cols-[repeat(4,minmax(270px,1fr))] gap-5 overflow-x-auto pb-4 lg:grid-cols-4 lg:overflow-visible">
                    {centres.map(({ title, department, description, icon: Icon, href }) => (
                        <Card
                            key={title}
                            className="group flex min-h-64 snap-start flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs transition-all hover:border-fmca-green/30 hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="flex size-11 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green">
                                        <Icon size={22} aria-hidden="true" />
                                    </span>
                                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-fmca-green">
                                        Specialty unit
                                    </span>
                                </div>
                                <span className="mt-4 block text-xs font-semibold text-slate-500">
                                    {department}
                                </span>
                                <h3 className="mt-1 font-display text-base font-bold text-fmca-green-dark sm:text-lg">
                                    {title}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                    {description}
                                </p>
                            </div>
                            <a
                                href={href}
                                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-fmca-green group-hover:text-fmca-green-dark"
                            >
                                <span>Clinical pathways</span>
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </a>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
