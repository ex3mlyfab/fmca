import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { Button } from '@/components/ui/button';

export type CampaignSlide = {
    id?: number;
    title: string;
    copy: string;
    eyebrow?: string | null;
    image?: string | null;
    mobileImage?: string | null;
    imageAlt?: string | null;
    focalPoint?: string | null;
    videoPoster?: string | null;
    primaryCtaLabel?: string | null;
    primaryCtaHref?: string | null;
    secondaryCtaLabel?: string | null;
    secondaryCtaHref?: string | null;
    owner?: string | null;
    advisory?: boolean;
    overlayIntensity?: number | null;
};

export type CampaignCarouselProps = {
    slides?: CampaignSlide[];
    autoAdvanceIntervalMs?: number;
};

/**
 * Shown only when no campaign has been published yet; the home hero is a
 * content module, so with nothing published this static block stands in.
 */
const institutionalFallback: CampaignSlide[] = [
    {
        eyebrow: 'Tertiary Health Institution',
        title: 'Federal Medical Centre, Abuja',
        copy: 'Clear, compassionate guidance for patients, families and referring clinical teams. Published campaigns from the FMCA communications team will appear here.',
        primaryCtaLabel: 'Find patient services',
        primaryCtaHref: '#services',
        secondaryCtaLabel: 'Visiting hours',
        secondaryCtaHref: '#visiting',
    },
];

export function CampaignCarousel({
    slides = [],
    autoAdvanceIntervalMs = 8000,
}: CampaignCarouselProps) {
    const activeSlides = slides.length > 0 ? slides : institutionalFallback;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(query.matches);
        setIsPlaying(!query.matches);

        const listener = (event: MediaQueryListEvent) => setIsPlaying(!event.matches);
        query.addEventListener('change', listener);
        return () => query.removeEventListener('change', listener);
    }, []);

    useEffect(() => {
        setCurrentIndex(0);
    }, [activeSlides.length]);

    const currentSlide = activeSlides[currentIndex] ?? activeSlides[0];
    // Emergency and advisory content must never auto-advance.
    const autoAdvanceBlocked = !isPlaying || reducedMotion || activeSlides.length <= 1 || currentSlide.advisory;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev + activeSlides.length - 1) % activeSlides.length);
    };

    useEffect(() => {
        if (autoAdvanceBlocked) {
            return;
        }

        const timer = setInterval(nextSlide, autoAdvanceIntervalMs);
        return () => clearInterval(timer);
    }, [autoAdvanceBlocked, activeSlides.length, autoAdvanceIntervalMs]);

    const handleKeyDown = (event: ReactKeyboardEvent) => {
        if (event.key === 'ArrowRight' && activeSlides.length > 1) {
            nextSlide();
        }

        if (event.key === 'ArrowLeft' && activeSlides.length > 1) {
            prevSlide();
        }
    };

    const handleTouchStart = (event: ReactTouchEvent) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event: ReactTouchEvent) => {
        if (touchStartX.current === null || activeSlides.length <= 1) {
            touchStartX.current = null;
            return;
        }

        const deltaX = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        touchStartX.current = null;

        if (Math.abs(deltaX) < 40) {
            return;
        }

        if (deltaX < 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    };

    const overlayIntensity = currentSlide.overlayIntensity ?? 40;
    const mediaElement = (src: string, className: string) =>
        currentSlide.imageAlt ? (
            <img
                src={src}
                alt={currentSlide.imageAlt}
                className={className}
                style={currentSlide.focalPoint ? { objectPosition: currentSlide.focalPoint } : undefined}
                fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
                loading={currentIndex === 0 ? 'eager' : 'lazy'}
            />
        ) : (
            <div className={className} aria-hidden="true" />
        );

    return (
        <section
            className="relative isolate min-h-[520px] overflow-hidden bg-fmca-green-dark text-white sm:min-h-[580px]"
            aria-roledescription="carousel"
            aria-label="Institutional campaigns"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
            onFocus={() => setIsPlaying(false)}
            onBlur={() => setIsPlaying(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background media (desktop / mobile) with dark scrim */}
            {currentSlide.image && (
                <div className="absolute inset-0 -z-20 hidden md:block">
                    {mediaElement(currentSlide.image, 'size-full object-cover transition-opacity duration-700')}
                </div>
            )}
            {currentSlide.mobileImage && (
                <div className="absolute inset-0 -z-20 md:hidden">
                    {mediaElement(currentSlide.mobileImage, 'size-full object-cover transition-opacity duration-700')}
                </div>
            )}
            {!currentSlide.image && !currentSlide.mobileImage && (
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.14)_0%,transparent_55%)]" aria-hidden="true" />
            )}
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,67,42,0.96)_0%,rgba(6,67,42,0.82)_55%,rgba(6,67,42,0.40)_100%)] transition-opacity duration-700"
                style={{ opacity: Math.max(0.1, Math.min(1, overlayIntensity / 100)) }}
                aria-hidden="true"
            />

            {/* Content Container */}
            <div className="mx-auto flex min-h-[520px] max-w-7xl items-end px-4 py-12 sm:min-h-[580px] sm:px-6 lg:items-center lg:py-16">
                <div className="max-w-xl">
                    {currentSlide.eyebrow && (
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                            {currentSlide.eyebrow}
                        </p>
                    )}
                    <h1 className="max-w-lg font-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
                        {currentSlide.title}
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                        {currentSlide.copy}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                        {currentSlide.primaryCtaLabel && (
                            <Button asChild className="h-12 bg-white px-5 font-bold text-fmca-green-dark shadow-sm hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white">
                                <a href={currentSlide.primaryCtaHref ?? '#services'}>
                                    {currentSlide.primaryCtaLabel}
                                    <ArrowRight size={17} className="ml-1" />
                                </a>
                            </Button>
                        )}
                        {currentSlide.secondaryCtaLabel && (
                            <Button asChild variant="outline" className="h-12 border-white/60 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white">
                                <a href={currentSlide.secondaryCtaHref ?? '#about'}>
                                    {currentSlide.secondaryCtaLabel}
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Accessible Carousel Controls */}
                    {activeSlides.length > 1 && (
                        <div className="mt-8 flex items-center gap-3" aria-label="Carousel navigation controls">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                                onClick={prevSlide}
                                aria-label="Previous slide"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <span className="text-sm font-semibold tabular-nums text-white/90" aria-live="polite">
                                0{currentIndex + 1} / 0{activeSlides.length}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                                onClick={nextSlide}
                                aria-label="Next slide"
                            >
                                <ChevronRight size={20} />
                            </Button>
                            {!currentSlide.advisory && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-12 text-white/80 hover:bg-white/10 hover:text-white"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    aria-label={isPlaying ? 'Pause automatic advance' : 'Resume automatic advance'}
                                >
                                    {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
