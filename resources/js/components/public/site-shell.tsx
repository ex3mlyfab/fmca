import { Link, usePage } from '@inertiajs/react';
import { CalendarPlus, Home, MapPin, Menu, PhoneCall, Search, Stethoscope, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { appointments, contact, consultants, home, legal, news, patients, search, services } from '@/routes';
import about from '@/routes/about';

// The header navigation is content-managed: editors add, reorder, edit and
// unpublish entries in the Content Studio "Site Menu" workspace. Only
// published items reach the public site, arriving as the shared `siteMenu`
// prop already ordered by sort order. An empty list is an editorial choice,
// not an error — the emblem, search, appointment and SOS actions still carry
// the header.

export function FmcaEmblem({ className = 'size-11' }: { className?: string }) {
    return (
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
            <rect width="44" height="44" rx="10" fill="#0B5D39" />
            <path d="M22 8L34 13.5V23C34 30.5 28.9 37.4 22 39C15.1 37.4 10 30.5 10 23V13.5L22 8Z" fill="#06432A" stroke="#F4F8F6" strokeWidth="1.5" />
            <rect x="19.5" y="16" width="5" height="15" rx="1.5" fill="#FFFFFF" />
            <rect x="14.5" y="21" width="15" height="5" rx="1.5" fill="#FFFFFF" />
            <circle cx="22" cy="23.5" r="2.2" fill="#D97706" />
        </svg>
    );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const navigation = usePage().props.siteMenu ?? [];

    return (
        <div className="min-h-screen bg-white text-fmca-ink">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-3">
                Skip to content
            </a>
            <div className="hidden bg-fmca-green-dark text-white lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-medium tracking-wide">
                    <span>Federal Republic of Nigeria | Federal Medical Centre, Abuja</span>
                    <span className="flex items-center gap-5"><span>Abuja, Nigeria</span><span>Patient desk: Verified dispatch line</span></span>
                </div>
            </div>
            <header className="sticky top-0 z-40 border-b border-fmca-ink/10 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
                    <Link href={home()} className="flex min-w-0 items-center gap-3" aria-label="FMCA home">
                        <FmcaEmblem className="size-11 shrink-0" />
                        <span className="min-w-0 leading-tight">
                            <strong className="block truncate font-display text-sm text-fmca-green-dark sm:text-base">Federal Medical Centre</strong>
                            <span className="block text-[11px] font-semibold tracking-[0.12em] text-slate-500">ABUJA | FMCA</span>
                        </span>
                    </Link>
                    <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
                        {navigation.map((item) => (
                            <a key={`${item.label} ${item.href}`} href={item.href} className="flex min-h-12 items-center text-sm font-semibold text-slate-700 transition-colors hover:text-fmca-green">
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="icon" className="size-12" aria-label="Search">
                            <Link href={search().url}>
                                <Search />
                            </Link>
                        </Button>
                        <Button asChild className="hidden h-12 bg-fmca-green px-5 hover:bg-fmca-green-dark sm:inline-flex">
                            <Link href={appointments()}>Request an appointment</Link>
                        </Button>
                        <a href="tel:+2340000000000" className="hidden min-h-12 items-center gap-2 rounded-md bg-fmca-crimson px-4 text-sm font-bold text-white hover:bg-red-700 lg:inline-flex">
                            <PhoneCall size={17} /> SOS
                        </a>
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="size-12 lg:hidden" aria-label="Open navigation"><Menu /></Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[min(88vw,380px)] bg-fmca-mist p-6">
                                <SheetTitle className="font-display text-fmca-green-dark">FMCA navigation</SheetTitle>
                                <div className="mt-8 flex flex-col gap-2">
                                    {navigation.map((item) => (
                                        <a key={`${item.label} ${item.href}`} href={item.href} onClick={() => setOpen(false)} className="flex min-h-14 items-center border-b border-fmca-ink/10 font-semibold text-fmca-ink">
                                            {item.label}
                                        </a>
                                    ))}
                                    <a href="tel:+2340000000000" className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-md bg-fmca-crimson font-bold text-white">
                                        <PhoneCall size={18} /> Emergency contact
                                    </a>
                                    <Link
                                        href={contact()}
                                        onClick={() => setOpen(false)}
                                        className="flex min-h-14 items-center justify-center gap-2 rounded-md bg-white font-bold text-fmca-ink"
                                    >
                                        <MapPin size={18} aria-hidden="true" /> Directions & contact
                                    </Link>
                                    <Link
                                        href={appointments()}
                                        onClick={() => setOpen(false)}
                                        className="flex min-h-14 items-center justify-center rounded-md bg-fmca-green font-bold text-white"
                                    >
                                        Request an appointment
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
            {children}
            <footer className="border-t border-fmca-ink/10 bg-fmca-green-dark pb-24 text-white lg:pb-0">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
                    <div>
                        <div className="flex items-center gap-3">
                            <FmcaEmblem className="size-10 shrink-0" />
                            <strong className="font-display text-lg">Federal Medical Centre, Abuja</strong>
                        </div>
                        <p className="mt-5 max-w-xs text-sm leading-6 text-white/70">
                            Public care and guidance for patients, families, referring clinicians and our community. Content verified by institutional approvers.
                        </p>
                    </div>
                    <FooterGroup
                        title="Explore"
                        links={[
                            { label: 'About FMCA', href: home() },
                            { label: 'Services', href: services() },
                            { label: 'Consultants', href: consultants() },
                            { label: 'Top Management Committee', href: about.leadership() },
                            { label: 'Patients & Visitors', href: patients() },
                            { label: 'News & Updates', href: news() },
                        ]}
                    />
                    <FooterGroup
                        title="Help"
                        links={[
                            { label: 'Directions', href: contact() },
                            { label: 'Request an appointment', href: appointments() },
                            { label: 'NHIA guidance', href: home() },
                            { label: 'Legal & Privacy', href: legal() },
                            { label: 'Contact FMCA', href: contact() },
                        ]}
                    />
                    <div>
                        <h2 className="font-display text-base font-bold">Contact</h2>
                        <p className="mt-4 text-sm leading-6 text-white/70">
                            Campus access and contact details are verified by the FMCA Communications and Clinical desks.
                        </p>
                        <a href="tel:+2340000000000" className="mt-5 inline-flex min-h-12 items-center gap-2 font-semibold text-white underline underline-offset-4">
                            <PhoneCall size={17} /> Emergency contact
                        </a>
                    </div>
                </div>
                <div className="border-t border-white/15">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between">
                        <span>© 2026 Federal Medical Centre, Abuja. All rights reserved.</span>
                        <span className="flex gap-5">
                            <a href="#privacy" className="hover:text-white">Privacy</a>
                            <a href="#accessibility" className="hover:text-white">Accessibility</a>
                        </span>
                    </div>
                </div>
            </footer>
            <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-fmca-ink/10 bg-white/95 px-2 py-2 shadow-[0_-8px_24px_rgba(24,48,42,0.08)] backdrop-blur lg:hidden" aria-label="Mobile quick navigation">
                <a href={home.url()} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-fmca-green">
                    <Home size={19} />
                    <span>Home</span>
                </a>
                <a href={services().url} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-fmca-green">
                    <Stethoscope size={19} />
                    <span>Services</span>
                </a>
                <a href="tel:+2340000000000" className="flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-fmca-crimson">
                    <PhoneCall size={19} />
                    <span>SOS</span>
                </a>
                <a href={appointments().url} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-fmca-green">
                    <CalendarPlus size={19} />
                    <span>Requests</span>
                </a>
            </nav>
        </div>
    );
}

type FooterLink = {
    label: string;
    href: ReturnType<typeof home>;
};

function FooterGroup({ title, links }: { title: string; links: FooterLink[] }) {
    return (
        <div>
            <h2 className="font-display text-base font-bold">{title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link href={link.href} className="hover:text-white">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function CloseIcon() { return <X aria-hidden="true" />; }