import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent as ReactKeyboardEvent,
    type TouchEvent as ReactTouchEvent,
} from 'react';
import { cn } from '@/lib/utils';

export type PartnerItem = {
    id: number;
    name: string;
    logo: string;
    websiteUrl?: string | null;
};

export type PartnersProps = {
    partners?: PartnerItem[];
    heading?: string;
    subheading?: string;
    autoAdvanceIntervalMs?: number;
};

/** How long a group of logos stays on screen before the next group appears. */
const AUTO_ADVANCE_INTERVAL_MS = 3500;

/** A horizontal swipe must clear this many pixels to count as navigation. */
const SWIPE_THRESHOLD_PX = 40;

/** Logos shown per group by breakpoint: four desktop, three tablet, two mobile. */
function groupSizeFor(large: boolean, medium: boolean): number {
    if (large) {
        return 4;
    }
    if (medium) {
        return 3;
    }
    return 2;
}

/**
 * Logos per group for the current viewport. Seeded at the narrowest size so a
 * server render matches the first client render, then measured before paint.
 */
function useGroupSize(): number {
    const [size, setSize] = useState(2);

    useLayoutEffect(() => {
        const large = window.matchMedia('(min-width: 1024px)');
        const medium = window.matchMedia('(min-width: 640px)');
        const update = () => setSize(groupSizeFor(large.matches, medium.matches));

        update();
        large.addEventListener('change', update);
        medium.addEventListener('change', update);
        return () => {
            large.removeEventListener('change', update);
            medium.removeEventListener('change', update);
        };
    }, []);

    return size;
}

/**
 * The home page partner wall, listed straight after the news section.
 *
 * Every partner is approved by the FMCA communications team before
 * publication, and every entry carries the organisation's own logo. The logos
 * rotate through in groups of four, three and two (desktop, tablet, mobile),
 * advancing on a timer and pausing on hover, focus or the pause control; under
 * a reduced-motion preference they sit still. When nothing is published the
 * section stays out of the page entirely rather than publishing an empty row
 * of placeholders.
 */
export function Partners({
    partners: items = [],
    heading = 'Partners & collaborations',
    subheading = 'Organisations working with FMCA on patient care, referral pathways and institutional programmes.',
    autoAdvanceIntervalMs = AUTO_ADVANCE_INTERVAL_MS,
}: PartnersProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section id="partners" className="bg-white py-14 sm:py-16 lg:py-20" aria-labelledby="partners-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Partnerships</p>
                        <h2
                            id="partners-heading"
                            className="mt-2 font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl lg:text-4xl"
                        >
                            {heading}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{subheading}</p>
                    </div>
                    <p className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                        {items.length} {items.length === 1 ? 'partner' : 'partners'}
                    </p>
                </div>

                <PartnerCarousel partners={items} autoAdvanceIntervalMs={autoAdvanceIntervalMs} />
            </div>
        </section>
    );
}

type PartnerCarouselProps = {
    partners: PartnerItem[];
    autoAdvanceIntervalMs: number;
};

const NAVIGATION_BUTTON_CLASS =
    'inline-flex size-12 items-center justify-center rounded-lg border border-fmca-ink/15 bg-white text-fmca-green-dark transition-colors hover:bg-fmca-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fmca-sky';

function PartnerCarousel({ partners, autoAdvanceIntervalMs }: PartnerCarouselProps) {
    const groupSize = useGroupSize();
    const groupCount = Math.max(1, Math.ceil(partners.length / groupSize));
    const singleGroup = groupCount <= 1;

    const [groupIndex, setGroupIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [reducedMotion, setReducedMotion] = useState(false);
    const touchStartX = useRef<number | null>(null);

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

    // A wider viewport means fewer groups, so the current index can over-run.
    useEffect(() => {
        setGroupIndex((current) => Math.min(current, groupCount - 1));
    }, [groupCount]);

    const goToGroup = useCallback(
        (target: number) => {
            if (groupCount <= 1) {
                return;
            }
            setGroupIndex(((target % groupCount) + groupCount) % groupCount);
        },
        [groupCount],
    );

    const nextGroup = useCallback(() => {
        if (groupCount <= 1) {
            return;
        }
        setGroupIndex((current) => (current + 1) % groupCount);
    }, [groupCount]);

    const previousGroup = useCallback(() => {
        if (groupCount <= 1) {
            return;
        }
        setGroupIndex((current) => (current - 1 + groupCount) % groupCount);
    }, [groupCount]);

    const autoplayBlocked = !isPlaying || reducedMotion || groupCount <= 1;

    useEffect(() => {
        if (autoplayBlocked) {
            return;
        }

        // Re-armed on every group change so a manual navigation starts a fresh
        // dwell rather than handing back control mid-cycle.
        const timer = setInterval(nextGroup, autoAdvanceIntervalMs);
        return () => clearInterval(timer);
    }, [autoplayBlocked, groupIndex, autoAdvanceIntervalMs, nextGroup]);

    const handleKeyDown = (event: ReactKeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            nextGroup();
        }
        if (event.key === 'ArrowLeft') {
            previousGroup();
        }
    };

    const handleTouchStart = (event: ReactTouchEvent) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event: ReactTouchEvent) => {
        const startX = touchStartX.current;
        touchStartX.current = null;
        if (startX === null || groupCount <= 1) {
            return;
        }

        const deltaX = (event.changedTouches[0]?.clientX ?? 0) - startX;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
            return;
        }

        if (deltaX < 0) {
            nextGroup();
        } else {
            previousGroup();
        }
    };

    // Each cell is one group slot wide, and the track box is exactly one group
    // wide, so advancing a group shifts the track by one full track width.
    const trackOffsetPercent = groupIndex * 100;

    return (
        <div
            {...(singleGroup
                ? {}
                : {
                    role: 'region',
                    'aria-roledescription': 'carousel',
                    'aria-label': 'Partner logos',
                    onKeyDown: handleKeyDown,
                    onMouseEnter: () => setIsPlaying(false),
                    onMouseLeave: () => setIsPlaying(true),
                    onFocus: () => setIsPlaying(false),
                    onBlur: () => setIsPlaying(true),
                    onTouchStart: handleTouchStart,
                    onTouchEnd: handleTouchEnd,
                })}
        >
            <div
                tabIndex={singleGroup ? undefined : 0}
                className={cn(
                    'mt-10 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs',
                    !singleGroup && 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fmca-sky',
                )}
            >
                <ul
                    className={cn('flex', !singleGroup && !reducedMotion && 'transition-transform duration-700 ease-out')}
                    style={{ transform: `translateX(-${trackOffsetPercent}%)` }}
                >
                    {partners.map((partner, index) => {
                        const groupStart = groupIndex * groupSize;
                        const outsideGroup = index < groupStart || index >= groupStart + groupSize;
                        return (
                            <PartnerLogoCell
                                key={partner.id}
                                partner={partner}
                                className={cn('min-w-0', singleGroup ? 'flex-1' : 'shrink-0')}
                                style={singleGroup ? undefined : { flexBasis: `${100 / groupSize}%` }}
                                slideLabel={singleGroup ? undefined : `${index + 1} of ${partners.length}`}
                                outsideGroup={outsideGroup}
                            />
                        );
                    })}
                </ul>
            </div>

            {!singleGroup && (
                <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <nav aria-label="Partner groups" className="flex h-12 flex-wrap items-center justify-center gap-1">
                        {Array.from({ length: groupCount }).map((_, index) => {
                            const isActive = index === groupIndex;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => goToGroup(index)}
                                    aria-label={`Show group ${index + 1} of ${groupCount}`}
                                    aria-current={isActive ? 'true' : undefined}
                                    className="group flex h-12 items-center rounded-md px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fmca-sky"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'block h-1 rounded-full transition-colors',
                                            isActive ? 'w-8 bg-fmca-green' : 'w-6 bg-fmca-ink/20 group-hover:bg-fmca-ink/40',
                                        )}
                                    />
                                </button>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold tabular-nums text-slate-600" aria-live="polite">
                            Group {groupIndex + 1} of {groupCount}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={previousGroup}
                                aria-label="Previous partner group"
                                className={NAVIGATION_BUTTON_CLASS}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPlaying(!isPlaying)}
                                aria-label={isPlaying ? 'Pause automatic advance' : 'Resume automatic advance'}
                                className={NAVIGATION_BUTTON_CLASS}
                            >
                                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                            </button>
                            <button
                                type="button"
                                onClick={nextGroup}
                                aria-label="Next partner group"
                                className={NAVIGATION_BUTTON_CLASS}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

type PartnerLogoCellProps = {
    partner: PartnerItem;
    className?: string;
    style?: CSSProperties;
    /** "n of total" slide label; omitted for the static single-group layout. */
    slideLabel?: string;
    /** Whether the logo sits outside the currently visible group. */
    outsideGroup?: boolean;
};

function PartnerLogoCell({
    partner,
    className,
    style,
    slideLabel,
    outsideGroup = false,
}: PartnerLogoCellProps) {
    // Logos outside the visible group are removed from the accessibility tree
    // and made unfocusable, so an off-screen logo cannot be tabbed to.
    const slideProps = slideLabel
        ? {
            role: 'group',
            'aria-roledescription': 'slide',
            'aria-label': slideLabel,
            'aria-hidden': outsideGroup || undefined,
            inert: outsideGroup,
        }
        : undefined;

    return (
        <li {...slideProps} className={cn('relative bg-white', className)} style={style}>
            {partner.websiteUrl ? (
                <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={partner.name}
                    className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fmca-sky"
                >
                    <PartnerLogo partner={partner} />
                </a>
            ) : (
                <PartnerLogo partner={partner} />
            )}
            {partner.websiteUrl && (
                <ExternalLink
                    size={13}
                    aria-hidden="true"
                    className="absolute right-2.5 top-2.5 text-slate-500 transition-colors group-hover:text-fmca-green"
                />
            )}
        </li>
    );
}

function PartnerLogo({ partner }: { partner: PartnerItem }) {
    return (
        <div className="flex h-24 w-full items-center justify-center px-6 py-4 sm:h-28">
            <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                loading="lazy"
                width="128"
                height="48"
                className="max-h-11 w-auto max-w-full object-contain"
            />
        </div>
    );
}
