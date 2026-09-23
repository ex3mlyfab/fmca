import { gsap } from 'gsap';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const pad = (value: number) => String(value).padStart(2, '0');

/** How long the slide transition stays on screen; the ambient drift waits for it. */
const TRANSITION_SETTLE_MS = 1500;

export function CampaignCarousel({
    slides = [],
    autoAdvanceIntervalMs = 8000,
}: CampaignCarouselProps) {
    const activeSlides = slides.length > 0 ? slides : institutionalFallback;
    const slideCount = activeSlides.length;
    const [activeIndex, setActiveIndex] = useState(0);
    /** The slide whose media/content stay mounted while the transition settles. */
    const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [transitionSettled, setTransitionSettled] = useState(false);
    const activeIndexRef = useRef(activeIndex);
    const isPlayingRef = useRef(isPlaying);
    const prevIndexRef = useRef<number | null>(null);
    const prevSlideCountRef = useRef(slideCount);
    const contentLayerRefs = useRef(new Map<number, HTMLDivElement>());
    const mediaLayerRefs = useRef(new Map<number, HTMLDivElement>());
    const progressRef = useRef<HTMLDivElement | null>(null);
    const transitionRef = useRef<gsap.core.Timeline | null>(null);
    const progressTweenRef = useRef<gsap.core.Tween | null>(null);
    const kenBurnsRef = useRef<gsap.core.Tween | null>(null);
    const touchStartX = useRef<number | null>(null);

    const currentSlide = activeSlides[activeIndex] ?? activeSlides[0];
    // Emergency and advisory content must never auto-advance.
    const autoAdvanceBlocked = !isPlaying || reducedMotion || slideCount <= 1 || currentSlide.advisory;
    const progressVisible = !reducedMotion && slideCount > 1;

    useEffect(() => {
        activeIndexRef.current = activeIndex;
    }, [activeIndex]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(query.matches);
        setIsPlaying(!query.matches);

        const listener = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
            setIsPlaying(!event.matches);
        };
        query.addEventListener('change', listener);
        return () => query.removeEventListener('change', listener);
    }, []);

    /**
     * Immediate, no-GSAP swap: state changes synchronously and the active
     * layer's CSS classes carry the visible result. A transition timeline
     * (or the entrance timeline on first mount) is then started from the
     * layout effect keyed on activeIndex.
     */
    const navigateTo = useCallback(
        (target: number) => {
            if (slideCount <= 1) {
                return;
            }
            const normalized = ((target % slideCount) + slideCount) % slideCount;
            if (normalized === activeIndexRef.current) {
                return;
            }
            setTransitionSettled(false);
            setLeavingIndex(activeIndexRef.current);
            setActiveIndex(normalized);
        },
        [slideCount],
    );

    const nextSlide = () => navigateTo(activeIndexRef.current + 1);
    const prevSlide = () => navigateTo(activeIndexRef.current - 1);

    /** Revert all inline GSAP state so the CSS class state is authoritative. */
    const clearInlineState = useCallback(() => {
        for (const element of contentLayerRefs.current.values()) {
            gsap.set(element, { clearProps: 'opacity' });
        }
        for (const element of mediaLayerRefs.current.values()) {
            gsap.set(element, { clearProps: 'opacity,visibility,transform,clipPath' });
        }
    }, []);

    /** First-mount (or slides-replaced) entrance: media settles, text reveals line by line. */
    const playEntrance = useCallback((index: number) => {
        transitionRef.current?.kill();
        kenBurnsRef.current?.kill();
        kenBurnsRef.current = null;

        const layer = contentLayerRefs.current.get(index);
        const media = mediaLayerRefs.current.get(index);
        const words = layer ? gsap.utils.toArray<HTMLElement>(layer.querySelectorAll('.campaign-word')) : [];
        const eyebrow = layer?.querySelector('.campaign-eyebrow') ?? null;
        const copy = layer?.querySelector('.campaign-copy') ?? null;
        const cta = layer?.querySelector('.campaign-cta') ?? null;

        if (layer) {
            gsap.set(layer, { opacity: 1 });
        }
        if (media) {
            gsap.set(media, { opacity: 1, visibility: 'visible', clipPath: 'inset(0% 0% 0% 0%)', scale: 1.08 });
        }
        gsap.set(words, { yPercent: 110 });
        const supports = [eyebrow, copy, cta].filter((element): element is Element => element !== null);
        gsap.set(supports, { opacity: 0 });

        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        transitionRef.current = timeline;
        timeline.eventCallback('onComplete', () => {
            transitionRef.current = null;
            setTransitionSettled(true);
        });

        if (media) {
            timeline.to(media, { scale: 1, duration: 1.6 }, 0);
        }
        if (eyebrow) {
            gsap.set(eyebrow, { y: 12 });
            timeline.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.25);
        }
        timeline.to(words, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.055 }, 0.35);
        if (copy) {
            gsap.set(copy, { y: 18 });
            timeline.to(copy, { opacity: 1, y: 0, duration: 0.8 }, 0.8);
        }
        if (cta) {
            gsap.set(cta, { y: 14 });
            timeline.to(cta, { opacity: 1, y: 0, duration: 0.8 }, 1.0);
        }
    }, []);

    /**
     * One coordinated timeline per slide change:
     * 1. outgoing headline masks up, 2. outgoing copy/CTA exit,
     * 3. outgoing media zooms, 4. incoming media wipes in via clip-path + scale,
     * 5-8. incoming eyebrow, headline, copy and CTA reveal in sequence.
     */
    const runTransition = useCallback(
        (from: number, to: number) => {
            transitionRef.current?.kill();
            kenBurnsRef.current?.kill();
            kenBurnsRef.current = null;

            const fromLayer = contentLayerRefs.current.get(from);
            const toLayer = contentLayerRefs.current.get(to);
            const fromMedia = mediaLayerRefs.current.get(from) ?? null;
            const toMedia = mediaLayerRefs.current.get(to) ?? null;

            const fromWords = fromLayer ? gsap.utils.toArray<HTMLElement>(fromLayer.querySelectorAll('.campaign-word')) : [];
            const toWords = toLayer ? gsap.utils.toArray<HTMLElement>(toLayer.querySelectorAll('.campaign-word')) : [];
            const fromSupport = [fromLayer?.querySelector('.campaign-eyebrow'), fromLayer?.querySelector('.campaign-copy'), fromLayer?.querySelector('.campaign-cta')].filter(
                (element): element is Element => element !== null && element !== undefined,
            );
            const toEyebrow = toLayer?.querySelector('.campaign-eyebrow') ?? null;
            const toCopy = toLayer?.querySelector('.campaign-copy') ?? null;
            const toCta = toLayer?.querySelector('.campaign-cta') ?? null;

            if (toLayer) {
                gsap.set(toLayer, { opacity: 1 });
            }
            gsap.set(toWords, { yPercent: 110 });
            const toSupport = [toEyebrow, toCopy, toCta].filter((element): element is Element => element !== null);
            gsap.set(toSupport, { opacity: 0 });
            if (toMedia) {
                // Hold the incoming media fully hidden until its wipe begins.
                gsap.set(toMedia, { opacity: 1, visibility: 'visible', clipPath: 'inset(0% 0% 0% 100%)', scale: 1.12 });
            }

            const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
            transitionRef.current = timeline;
            timeline.eventCallback('onComplete', () => {
                transitionRef.current = null;
                setLeavingIndex(null);
                setTransitionSettled(true);
            });

            // 1 — outgoing headline exits upward through its masks.
            timeline.to(fromWords, { yPercent: -110, duration: 0.5, ease: 'power3.in', stagger: 0.025 }, 0);
            // 2 — outgoing support copy and CTAs slide away.
            if (fromSupport.length > 0) {
                timeline.to(fromSupport, { y: -14, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0.08);
            }
            if (fromLayer) {
                timeline.set(fromLayer, { opacity: 0 }, 0.55);
            }
            // 3 — outgoing media drifts deeper (relative to its current drift position).
            if (fromMedia) {
                timeline.to(fromMedia, { scale: '+=0.06', opacity: 0, duration: 0.95, ease: 'power2.inOut' }, 0.15);
            }
            // 4 — incoming media reveals through a cinematic clip-path wipe.
            if (toMedia) {
                timeline.to(toMedia, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.05, ease: 'power3.inOut' }, 0.3);
            }
            // 5 — incoming eyebrow.
            if (toEyebrow) {
                gsap.set(toEyebrow, { y: 12 });
                timeline.to(toEyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.8);
            }
            // 6 — incoming headline reveals line by line from behind its masks.
            timeline.to(toWords, { yPercent: 0, duration: 0.95, ease: 'power4.out', stagger: 0.06 }, 0.65);
            // 7 — incoming copy.
            if (toCopy) {
                gsap.set(toCopy, { y: 18 });
                timeline.to(toCopy, { opacity: 1, y: 0, duration: 0.8 }, 1.0);
            }
            // 8 — incoming CTA.
            if (toCta) {
                gsap.set(toCta, { y: 14 });
                timeline.to(toCta, { opacity: 1, y: 0, duration: 0.8 }, 1.2);
            }
            if (fromMedia) {
                timeline.set(fromMedia, { visibility: 'hidden' }, 1.35);
            }
        },
        [],
    );

    useLayoutEffect(() => {
        const previous = prevIndexRef.current;
        prevIndexRef.current = activeIndex;

        if (slideCount <= 1 || reducedMotion) {
            transitionRef.current?.kill();
            transitionRef.current = null;
            kenBurnsRef.current?.kill();
            kenBurnsRef.current = null;
            setLeavingIndex(null);
            clearInlineState();
            return;
        }

        if (previous === null) {
            playEntrance(activeIndex);
            return;
        }
        if (previous !== activeIndex) {
            runTransition(previous, activeIndex);
        }
    }, [activeIndex, reducedMotion, slideCount, playEntrance, runTransition, clearInlineState]);

    // When the slide set itself changes, start again from the first slide.
    // Guarded so the mount-time run (which would null out the ref the layout
    // effect just set) is skipped — only a genuine count change restarts.
    useEffect(() => {
        if (prevSlideCountRef.current === slideCount) {
            return;
        }
        prevSlideCountRef.current = slideCount;
        prevIndexRef.current = null;
        setLeavingIndex(null);
        setTransitionSettled(false);
        transitionRef.current?.kill();
        transitionRef.current = null;
        setActiveIndex(0);
    }, [slideCount]);

    // Auto-advance: the interval is the source of truth; the progress bar below
    // mirrors it and restarts whenever the active slide or cadence changes.
    useEffect(() => {
        if (autoAdvanceBlocked || slideCount <= 1) {
            return;
        }

        const timer = setInterval(nextSlide, autoAdvanceIntervalMs);
        return () => clearInterval(timer);
    }, [autoAdvanceBlocked, activeIndex, slideCount, autoAdvanceIntervalMs, navigateTo]);

    // Progress indicator: restart on slide change, freeze on hover/focus/user pause.
    useEffect(() => {
        const bar = progressRef.current;
        if (!bar) {
            return;
        }

        progressTweenRef.current?.kill();
        progressTweenRef.current = null;

        if (!progressVisible) {
            gsap.set(bar, { scaleX: 0 });
            return;
        }

        const tween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: autoAdvanceIntervalMs / 1000, ease: 'none' });
        progressTweenRef.current = tween;
        if (!isPlayingRef.current) {
            tween.pause();
        }

        return () => {
            tween.kill();
            progressTweenRef.current = null;
        };
    }, [progressVisible, activeIndex, autoAdvanceIntervalMs]);

    useEffect(() => {
        const tween = progressTweenRef.current;
        if (!tween) {
            return;
        }
        if (isPlaying) {
            tween.resume();
        } else {
            tween.pause();
        }
    }, [isPlaying]);

    // Ambient background drift while a slide dwells: subtle zoom that resumes
    // after the transition has settled and never runs for advisory content.
    useEffect(() => {
        const media = mediaLayerRefs.current.get(activeIndex);
        if (!media || !transitionSettled || reducedMotion || autoAdvanceBlocked || transitionRef.current) {
            return;
        }

        const driftMs = Math.max(500, autoAdvanceIntervalMs - TRANSITION_SETTLE_MS);
        const tween = gsap.fromTo(media, { scale: 1 }, { scale: 1.05, duration: driftMs / 1000, ease: 'none' });
        kenBurnsRef.current = tween;

        return () => {
            tween.kill();
        };
    }, [activeIndex, leavingIndex, transitionSettled, reducedMotion, autoAdvanceBlocked, autoAdvanceIntervalMs]);

    // Kill every owned tween on unmount.
    useEffect(
        () => () => {
            transitionRef.current?.kill();
            progressTweenRef.current?.kill();
            kenBurnsRef.current?.kill();
        },
        [],
    );

    const handleKeyDown = (event: ReactKeyboardEvent) => {
        if (event.key === 'ArrowRight' && slideCount > 1) {
            nextSlide();
        }

        if (event.key === 'ArrowLeft' && slideCount > 1) {
            prevSlide();
        }
    };

    const handleTouchStart = (event: ReactTouchEvent) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event: ReactTouchEvent) => {
        if (touchStartX.current === null || slideCount <= 1) {
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

    // Preload the next slide's media (and hold the outgoing one until its
    // exit settles); every other media stays out of the DOM.
    const mediaLayerIndexes = (() => {
        const set = new Set<number>([activeIndex, slideCount > 1 ? (activeIndex + 1) % slideCount : activeIndex]);
        if (leavingIndex !== null) {
            set.add(leavingIndex);
        }
        return [...set];
    })();

    const attachContentLayer = (index: number) => (element: HTMLDivElement | null) => {
        if (element) {
            contentLayerRefs.current.set(index, element);
        } else {
            contentLayerRefs.current.delete(index);
        }
    };

    const attachMediaLayer = (index: number) => (element: HTMLDivElement | null) => {
        if (element) {
            mediaLayerRefs.current.set(index, element);
        } else {
            mediaLayerRefs.current.delete(index);
        }
    };

    const mediaImages = (slide: CampaignSlide, index: number, isActive: boolean) => (
        <>
            {slide.image && (
                <img
                    src={slide.image}
                    alt={isActive ? (slide.imageAlt ?? '') : ''}
                    className="hidden size-full object-cover will-change-transform md:block"
                    style={slide.focalPoint ? { objectPosition: slide.focalPoint } : undefined}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                />
            )}
            {slide.mobileImage && (
                <img
                    src={slide.mobileImage}
                    alt={isActive ? (slide.imageAlt ?? '') : ''}
                    className="size-full object-cover will-change-transform md:hidden"
                    style={slide.focalPoint ? { objectPosition: slide.focalPoint } : undefined}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                />
            )}
        </>
    );

    return (
        <section
            className="relative isolate min-h-[540px] overflow-hidden bg-fmca-green-dark text-white sm:min-h-[620px] lg:min-h-[680px]"
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
            {/* Media layers: active + preloaded next (+ outgoing until it settles) */}
            {mediaLayerIndexes.map((index) => {
                const slide = activeSlides[index];
                const isActive = index === activeIndex;
                return (
                    <div key={`media-${index}`} ref={attachMediaLayer(index)} className={cn('absolute inset-0 -z-20', isActive ? 'opacity-100' : 'opacity-0')}>
                        {slide.image || slide.mobileImage ? mediaImages(slide, index, isActive) : (
                            <div className="size-full bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.14)_0%,transparent_55%)]" aria-hidden="true" />
                        )}
                    </div>
                );
            })}

            {/* Automated gradient scrim for text readability over variable media */}
            <div
                className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,67,42,0.96)_0%,rgba(6,67,42,0.82)_55%,rgba(6,67,42,0.40)_100%)] transition-opacity duration-700"
                style={{ opacity: Math.max(0.1, Math.min(1, overlayIntensity / 100)) }}
                aria-hidden="true"
            />

            {/* Content layers: active slide (+ outgoing, mounted until the transition settles) */}
            {[...new Set<number>([activeIndex, ...(leavingIndex !== null ? [leavingIndex] : [])])].map((index) => {
                const slide = activeSlides[index];
                const isActive = index === activeIndex;
                const words = slide.title.trim().split(/\s+/).filter(Boolean);
                return (
                    <div
                        key={`layer-${index}`}
                        ref={attachContentLayer(index)}
                        inert={!isActive}
                        aria-hidden={!isActive || undefined}
                        className={cn('absolute inset-0 flex items-end lg:items-center', isActive ? 'opacity-100' : 'opacity-0')}
                        {...(isActive && slideCount > 1
                            ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${index + 1} of ${slideCount}` }
                            : null)}
                    >
                        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-12 sm:px-6 lg:pb-20">
                            <div className="max-w-xl">
                                {slide.eyebrow && (
                                    <p className="campaign-eyebrow mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                                        <span className="h-px w-8 bg-emerald-300/80" aria-hidden="true" />
                                        {slide.eyebrow}
                                    </p>
                                )}
                                <h1 className="max-w-lg font-display text-[clamp(2.75rem,5.5vw,4.5rem)] font-extrabold leading-[1.04] tracking-tight text-balance">
                                    {words.flatMap((word, wordIndex) => [
                                        ...(wordIndex > 0 ? [' '] : []),
                                        <span key={wordIndex} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
                                            <span className="campaign-word inline-block will-change-transform">{word}</span>
                                        </span>,
                                    ])}
                                </h1>
                                <p className="campaign-copy mt-5 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">{slide.copy}</p>

                                <div className="campaign-cta mt-7 flex flex-wrap gap-3">
                                    {slide.primaryCtaLabel && (
                                        <Button asChild className="group h-12 bg-white px-5 font-bold text-fmca-green-dark shadow-sm hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white">
                                            <a href={slide.primaryCtaHref ?? '#services'}>
                                                {slide.primaryCtaLabel}
                                                <ArrowRight size={17} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                                            </a>
                                        </Button>
                                    )}
                                    {slide.secondaryCtaLabel && (
                                        <Button asChild variant="outline" className="group h-12 border-white/60 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white">
                                            <a href={slide.secondaryCtaHref ?? '#about'}>
                                                {slide.secondaryCtaLabel}
                                                <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Bottom navigation: numbered indicators, status, controls, progress bar */}
            {slideCount > 1 && (
                <div className="absolute inset-x-0 bottom-0 z-10">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <nav aria-label="Slide indicators" className="flex h-12 items-center gap-2 sm:gap-4">
                            {activeSlides.map((slide, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <button
                                        key={slide.id ?? index}
                                        type="button"
                                        onClick={() => navigateTo(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                        aria-current={isActive ? 'true' : undefined}
                                        className="group flex h-12 items-center gap-2 rounded-sm px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fmca-sky"
                                    >
                                        <span className={cn('text-sm font-semibold tabular-nums', isActive ? 'text-white' : 'text-white/70 transition-colors group-hover:text-white')}>
                                            {pad(index + 1)}
                                        </span>
                                        <span className="relative block h-[2px] w-8 overflow-hidden sm:w-12" aria-hidden="true">
                                            <span
                                                className={cn(
                                                    'absolute inset-y-0 left-0 w-full origin-left transition-transform duration-300',
                                                    isActive ? 'scale-x-100 bg-white' : 'scale-x-1/4 bg-white/50 group-hover:scale-x-1/2',
                                                )}
                                            />
                                        </span>
                                    </button>
                                );
                            })}
                            <span className="ml-1 text-sm font-semibold tabular-nums text-white/90" aria-live="polite">
                                {pad(activeIndex + 1)} / {pad(slideCount)}
                            </span>
                        </nav>

                        <div className="flex items-center gap-2" aria-label="Carousel navigation controls">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                                onClick={prevSlide}
                                aria-label="Previous slide"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            {!currentSlide.advisory && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-12 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    aria-label={isPlaying ? 'Pause automatic advance' : 'Resume automatic advance'}
                                >
                                    {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
                                onClick={nextSlide}
                                aria-label="Next slide"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </div>

                    {progressVisible && (
                        <div data-hero-progress className="h-[3px] w-full bg-white/15" aria-hidden="true">
                            <div ref={progressRef} className="h-full w-full origin-left bg-emerald-300" style={{ transform: 'scaleX(0)' }} />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
