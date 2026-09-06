import { Link } from '@inertiajs/react';
import { Menu, PhoneCall, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { home } from '@/routes';

const navigation = [
    ['About FMCA', '#about'],
    ['Services', '#services'],
    ['Patients & Visitors', '#visiting'],
    ['News & Updates', '#updates'],
];

export function SiteShell({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-fmca-ink">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-3">
                Skip to content
            </a>
            <div className="hidden bg-fmca-green-dark text-white lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-medium tracking-wide">
                    <span>Federal Republic of Nigeria · Federal Medical Centre, Abuja</span>
                    <span className="flex items-center gap-5"><span>Abuja, Nigeria</span><span>Patient information desk: demo line</span></span>
                </div>
            </div>
            <header className="sticky top-0 z-40 border-b border-fmca-ink/10 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
                    <Link href={home()} className="flex min-w-0 items-center gap-3" aria-label="FMCA home">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-fmca-green text-lg font-bold text-white">F</span>
                        <span className="min-w-0 leading-tight"><strong className="block truncate font-display text-sm text-fmca-green-dark sm:text-base">Federal Medical Centre</strong><span className="block text-[11px] font-semibold tracking-[0.12em] text-slate-500">ABUJA · FMCA</span></span>
                    </Link>
                    <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
                        {navigation.map(([label, href]) => <a key={label} href={href} className="flex min-h-12 items-center text-sm font-semibold text-slate-700 transition-colors hover:text-fmca-green">{label}</a>)}
                    </nav>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="size-12" aria-label="Search"><Search /></Button>
                        <Button asChild className="hidden h-12 bg-fmca-green px-5 hover:bg-fmca-green-dark sm:inline-flex"><a href="#request">Request an appointment</a></Button>
                        <a href="tel:+2340000000000" className="hidden min-h-12 items-center gap-2 rounded-md bg-fmca-crimson px-4 text-sm font-bold text-white hover:bg-red-700 lg:inline-flex"><PhoneCall size={17} /> SOS</a>
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild><Button variant="outline" size="icon" className="size-12 lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger>
                            <SheetContent side="right" className="w-[min(88vw,380px)] bg-fmca-mist p-6">
                                <SheetTitle className="font-display text-fmca-green-dark">FMCA navigation</SheetTitle>
                                <div className="mt-8 flex flex-col gap-2">
                                    {navigation.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)} className="flex min-h-14 items-center border-b border-fmca-ink/10 font-semibold text-fmca-ink">{label}</a>)}
                                    <a href="tel:+2340000000000" className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-md bg-fmca-crimson font-bold text-white"><PhoneCall size={18} /> Emergency contact</a>
                                    <a href="#request" onClick={() => setOpen(false)} className="flex min-h-14 items-center justify-center rounded-md bg-fmca-green font-bold text-white">Request an appointment</a>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
            {children}
            <footer className="border-t border-fmca-ink/10 bg-fmca-green-dark pb-24 text-white lg:pb-0">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
                    <div><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-white font-display font-bold text-fmca-green">F</span><strong className="font-display">Federal Medical Centre, Abuja</strong></div><p className="mt-5 max-w-xs text-sm leading-6 text-white/70">Public information for patients, families, referrers and our community. Demo content awaits FMCA verification.</p></div>
                    <FooterGroup title="Explore" links={['About FMCA', 'Services', 'Patients & Visitors', 'News & Updates']} />
                    <FooterGroup title="Help" links={['Directions', 'Request an appointment', 'NHIA guidance', 'Contact FMCA']} />
                    <div><h2 className="font-display text-base font-bold">Contact</h2><p className="mt-4 text-sm leading-6 text-white/70">Campus access and contact details will be confirmed by the FMCA owner before publication.</p><a href="tel:+2340000000000" className="mt-5 inline-flex min-h-12 items-center gap-2 font-semibold text-white underline underline-offset-4"><PhoneCall size={17} /> Emergency contact</a></div>
                </div>
                <div className="border-t border-white/15"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between"><span>© 2026 FMCA · Demo content pending institutional approval</span><span className="flex gap-5"><a href="#privacy" className="hover:text-white">Privacy</a><a href="#accessibility" className="hover:text-white">Accessibility</a></span></div></div>
            </footer>
            <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-fmca-ink/10 bg-white/95 px-2 py-2 shadow-[0_-8px_24px_rgba(24,48,42,0.08)] backdrop-blur lg:hidden" aria-label="Mobile quick navigation">
                <a href={home.url()} className="flex min-h-12 flex-col items-center justify-center text-[11px] font-semibold text-fmca-green"><span className="text-lg">⌂</span>Home</a><a href="#services" className="flex min-h-12 flex-col items-center justify-center text-[11px] font-semibold text-slate-600"><span className="text-lg">+</span>Services</a><a href="tel:+2340000000000" className="flex min-h-12 flex-col items-center justify-center text-[11px] font-semibold text-fmca-crimson"><PhoneCall size={18} />SOS</a><a href="#request" className="flex min-h-12 flex-col items-center justify-center text-[11px] font-semibold text-slate-600"><span className="text-lg">□</span>Requests</a>
            </nav>
        </div>
    );
}

function FooterGroup({ title, links }: { title: string; links: string[] }) {
    return <div><h2 className="font-display text-base font-bold">{title}</h2><ul className="mt-4 space-y-3 text-sm text-white/70">{links.map((link) => <li key={link}><a href="#content" className="hover:text-white">{link}</a></li>)}</ul></div>;
}

export function CloseIcon() { return <X aria-hidden="true" />; }