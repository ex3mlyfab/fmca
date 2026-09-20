import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarPlus, MapPin, Stethoscope } from 'lucide-react';
import { SiteShell } from '@/components/public/site-shell';
import { Button } from '@/components/ui/button';
import { appointments, contact, home, services } from '@/routes';

type Props = {
    error: {
        status: number;
    };
};

const helpLinks = [
    {
        label: 'Browse clinical services',
        description: 'Explore verified departments and outpatient services.',
        href: services(),
        icon: Stethoscope,
    },
    {
        label: 'Request an appointment',
        description: 'Submit an outpatient clinic request for follow-up.',
        href: appointments(),
        icon: CalendarPlus,
    },
    {
        label: 'Contact & directions',
        description: 'Campus access, visiting hours and website feedback.',
        href: contact(),
        icon: MapPin,
    },
];

export default function NotFound({ error }: Props) {
    const isServerError = error.status >= 500;

    return (
        <SiteShell>
            <Head title={`${isServerError ? 'Something went wrong' : 'Page not found'} | Federal Medical Centre, Abuja`}>
                <meta name="robots" content="noindex" />
            </Head>
            <main id="main-content">
                <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <p className="font-display text-6xl font-bold text-fmca-green-dark sm:text-7xl">
                            {isServerError ? '500' : '404'}
                        </p>
                        <h1 className="mt-4 font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl">
                            {isServerError ? 'Something went wrong' : 'Page not found'}
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {isServerError
                                ? "We're having trouble processing your request. Please try again in a moment."
                                : "We couldn't find the page you're looking for. It may have moved or no longer exists."}
                        </p>
                        <div className="mt-8">
                            <Button asChild className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark">
                                <Link href={home()}>Return to home</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-14 grid gap-5 sm:grid-cols-3">
                        {helpLinks.map(({ label, description, href, icon: Icon }) => (
                            <Link
                                key={label}
                                href={href}
                                className="group flex min-h-40 flex-col justify-between rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:border-fmca-green/40 hover:shadow-md focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <div>
                                    <span className="flex size-11 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green transition-colors group-hover:bg-fmca-green group-hover:text-white">
                                        <Icon size={22} aria-hidden="true" />
                                    </span>
                                    <h2 className="mt-4 font-display text-lg font-bold text-fmca-green-dark">{label}</h2>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{description}</p>
                                </div>
                                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fmca-green">
                                    <span>Open</span>
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </SiteShell>
    );
}
