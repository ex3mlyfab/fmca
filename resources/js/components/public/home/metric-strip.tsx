export type MetricItem = {
    value: string;
    label: string;
    detail?: string;
};

export type MetricStripProps = {
    metrics?: MetricItem[];
};

const defaultMetrics: MetricItem[] = [
    { value: '24/7', label: 'Emergency triage & trauma care', detail: 'Round-the-clock clinical cover' },
    { value: '35+', label: 'Clinical specialties', detail: 'Consultant-led departments' },
    { value: '450+', label: 'Inpatient hospital beds', detail: 'Tertiary referral capacity' },
    { value: '100%', label: 'Verified clinical governance', detail: 'Quality & safety compliance' },
];

export function MetricStrip({ metrics = defaultMetrics }: MetricStripProps) {
    return (
        <section className="bg-fmca-green-dark py-10 text-white" aria-label="Hospital capacity and institutional metrics">
            <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-white/15 sm:grid-cols-4 sm:divide-x sm:divide-y-0 px-4 sm:px-6">
                {metrics.map(({ value, label, detail }, index) => (
                    <div
                        key={label}
                        className={`flex flex-col justify-center px-4 py-4 sm:py-0 ${
                            index === 0 ? 'sm:pl-0' : ''
                        } ${index === metrics.length - 1 ? 'sm:pr-0' : ''}`}
                    >
                        <strong className="block font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl text-emerald-300">
                            {value}
                        </strong>
                        <span className="mt-1 block text-sm font-medium text-white/90">
                            {label}
                        </span>
                        {detail && (
                            <span className="mt-0.5 block text-xs text-white/60">
                                {detail}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
