import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export type CampaignSlide = {
    eyebrow?: string;
    title: string;
    copy: string;
    image?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
};

export type CampaignCarouselProps = {
    slides?: CampaignSlide[];
    autoAdvanceIntervalMs?: number;
};

const defaultSlides: CampaignSlide[] = [
    {
        eyebrow: 'Tertiary Health Institution',
        title: 'Care information you can trust',
        copy: 'Clear, compassionate guidance for patients, families and referring clinical teams across the Federal Capital Territory.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=80',
        primaryCtaLabel: 'Find patient services',
        primaryCtaHref: '#services',
        secondaryCtaLabel: 'About FMCA',
        secondaryCtaHref: '#about',
    },
    {
        eyebrow: 'Clinical Excellence and Training',
        title: 'A centre for healing and medical learning',
        copy: 'Consultant-led clinical specialties, medical residency and verified diagnostic facilities dedicated to patient outcomes.',
        image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1800&q=80',
        primaryCtaLabel: 'Explore clinical care',
        primaryCtaHref: '#services',
        secondaryCtaLabel: 'Visiting hours',
        secondaryCtaHref: '#visiting',
    },
];

export function CampaignCarousel({
    slides = defaultSlides,
    autoAdvanceIntervalMs = 8000,
}: CampaignCarouselProps) {
    const activeSlides = slides.length > 0 ? slides : defaultSlides;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev + activeSlides.length - 1) % activeSlides.length);
    };

    useEffect(() => {
        if (!isPlaying || activeSlides.length <= 1) {
            return;
        }

        const timer = setInterval(nextSlide, autoAdvanceIntervalMs);
        return () => clearInterval(timer);
    }, [isPlaying, activeSlides.length, autoAdvanceIntervalMs]);

    const currentSlide = activeSlides[currentIndex] ?? activeSlides[0];

    return (
        <section
            className="relative isolate min-h-[520px] overflow-hidden bg-fmca-green-dark text-white sm:min-h-[580px]"
            aria-roledescription="carousel"
            aria-label="Institutional campaigns"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
            onFocus={() => setIsPlaying(false)}
            onBlur={() => setIsPlaying(true)}
        >
            {/* Background Image with Dark Scrim */}
            {currentSlide.image && (
                <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className="absolute inset-0 -z-20 size-full object-cover transition-opacity duration-700"
                    fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
                />
            )}
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,67,42,0.96)_0%,rgba(6,67,42,0.82)_55%,rgba(6,67,42,0.40)_100%)]"
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
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-12 text-white/80 hover:bg-white/10 hover:text-white"
                                onClick={() => setIsPlaying(!isPlaying)}
                                aria-label={isPlaying ? 'Pause automatic advance' : 'Resume automatic advance'}
                            >
                                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
