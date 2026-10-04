import { ArrowRight, Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ResolvedSiteInfo } from '@/lib/site-info';

/**
 * Campus location: the embedded map when the CMS has coordinates or an embed
 * URL, otherwise the address card stands alone so visitors still get the
 * details and the directions link.
 */
export function MapSection({ siteInfo }: { siteInfo: ResolvedSiteInfo }) {
    const { mapEmbedUrl, mapAltText, campusName, addressLines, accessNote, locationLabel, directionsUrl } = siteInfo;

    return (
        <section className="border-y border-fmca-ink/10 bg-white px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="about-map-heading">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Location</p>
                <h2 id="about-map-heading" className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">
                    Finding the campus
                </h2>

                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    <div className="rounded-xl border border-fmca-ink/10 bg-fmca-mist p-6 sm:p-8">
                        <div className="flex items-center gap-2.5 text-fmca-green">
                            <MapPin size={20} aria-hidden="true" />
                            <h3 className="font-display text-xl font-bold text-fmca-green-dark">{locationLabel}</h3>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-slate-700">
                            <strong className="block font-bold text-fmca-green-dark">{campusName}</strong>
                            {addressLines.join(', ')}
                        </p>
                        <p className="mt-3 text-xs text-slate-500">{accessNote}</p>
                        <Button asChild className="mt-6 h-12 bg-fmca-green px-5 font-bold text-white shadow-sm hover:bg-fmca-green-dark">
                            <a href={directionsUrl} target="_blank" rel="noreferrer">
                                <span>Get directions</span>
                                <ArrowRight size={16} className="ml-1" aria-hidden="true" />
                            </a>
                        </Button>
                    </div>

                    {mapEmbedUrl ? (
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-fmca-ink/10 bg-fmca-mist">
                            <iframe
                                title={mapAltText}
                                src={mapEmbedUrl}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="h-full w-full border-0"
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-fmca-ink/20 bg-fmca-mist p-6 text-center">
                            <p className="flex max-w-xs items-start gap-2 text-xs leading-relaxed text-slate-600">
                                <Info size={17} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                                <span>
                                    The interactive campus map is not published yet. Use the address and the directions link beside it.
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
