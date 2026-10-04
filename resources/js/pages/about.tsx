import { Head } from '@inertiajs/react';
import { ContactSection, HistorySection, MapSection } from '@/components/public/about';
import { SiteShell } from '@/components/public/site-shell';
import { useSiteInfo } from '@/lib/site-info';

export default function About() {
    const siteInfo = useSiteInfo();

    return (
        <SiteShell>
            <Head title="About | Federal Medical Centre, Abuja" />
            <main id="main-content">
                <section className="bg-fmca-mist">
                    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">About FMCA</p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">
                            {siteInfo.institutionName}
                        </h1>
                        {siteInfo.aboutIntro && (
                            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 sm:text-base">
                                {siteInfo.aboutIntro}
                            </p>
                        )}
                    </div>
                </section>

                <HistorySection siteInfo={siteInfo} />
                <ContactSection siteInfo={siteInfo} />
                <MapSection siteInfo={siteInfo} />
            </main>
        </SiteShell>
    );
}
