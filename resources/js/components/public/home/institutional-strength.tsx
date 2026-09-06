import { Award, Clock3, GraduationCap, ShieldCheck, Stethoscope } from 'lucide-react';
import { Card } from '@/components/ui/card';

export type StrengthItem = {
    title: string;
    description: string;
    icon: typeof Stethoscope;
};

const defaultStrengths: StrengthItem[] = [
    {
        title: 'Postgraduate Medical Training',
        description: 'Accredited residency training in partnership with National and West African Postgraduate Medical Colleges.',
        icon: GraduationCap,
    },
    {
        title: 'Clinical Care Standards',
        description: 'Strict adherence to national clinical protocols and continuous quality improvement committees.',
        icon: Stethoscope,
    },
    {
        title: 'Institutional Governance',
        description: 'Transparent federal oversight, audited administrative workflows, and regulated clinical safety protocols.',
        icon: ShieldCheck,
    },
    {
        title: 'Verified Patient Guidance',
        description: 'Every published health pathway and clinic notice is reviewed by authorized clinical content owners.',
        icon: Clock3,
    },
];

export type InstitutionalStrengthProps = {
    heading?: string;
    description?: string;
    items?: StrengthItem[];
};

export function InstitutionalStrength({
    heading = 'A federal institution built on clinical competence, training, and public trust',
    description = 'Federal Medical Centre, Abuja combines tertiary-level medical interventions with postgraduate clinical residency and rigorous governance.',
    items = defaultStrengths,
}: InstitutionalStrengthProps) {
    return (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="strength-heading">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-5">
                    <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-bold text-fmca-green">
                        <Award size={15} aria-hidden="true" />
                        <span>Tertiary Medical Mandate</span>
                    </div>
                    <h2 id="strength-heading" className="mt-3 font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl lg:text-4xl">
                        {heading}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                        {description}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                    {items.map(({ title, description: desc, icon: Icon }) => (
                        <Card key={title} className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs">
                            <span className="flex size-11 items-center justify-center rounded-lg bg-fmca-mist text-fmca-teal">
                                <Icon size={22} aria-hidden="true" />
                            </span>
                            <h3 className="mt-4 font-display text-base font-bold text-fmca-green-dark">
                                {title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                {desc}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
