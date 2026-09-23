import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { gsap } from 'gsap';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CampaignCarousel, type CampaignSlide } from './campaign-carousel';

type ReducedMotionMock = {
    fireChange: (matches: boolean) => void;
};

/**
 * Replaces the default setup-file matchMedia mock with one that records
 * "change" listeners so a test can flip the reduced-motion preference.
 */
function mockReducedMotion(initial: boolean): ReducedMotionMock {
    let matches = initial;
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];

    vi.mocked(window.matchMedia).mockImplementation((query) => ({
        get matches() {
            return matches;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
            listeners.push(listener);
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList));

    return {
        fireChange: (next: boolean) => {
            matches = next;
            for (const listener of listeners) {
                listener({ matches: next } as MediaQueryListEvent);
            }
        },
    };
}

const slides: CampaignSlide[] = [
    { id: 1, title: 'Slide one', copy: 'First campaign', primaryCtaLabel: 'Act now', primaryCtaHref: '/services' },
    { id: 2, title: 'Slide two', copy: 'Second campaign', advisory: true },
    { id: 3, title: 'Slide three', copy: 'Third campaign' },
];

const mediaSlides: CampaignSlide[] = [
    { id: 1, title: 'Slide one', copy: 'First campaign', image: '/campaigns/one.webp', imageAlt: 'First campaign media' },
    { id: 2, title: 'Slide two', copy: 'Second campaign', image: '/campaigns/two.webp', imageAlt: 'Second campaign media' },
    { id: 3, title: 'Slide three', copy: 'Third campaign', image: '/campaigns/three.webp', imageAlt: 'Third campaign media' },
];

function section() {
    return screen.getByRole('region', { name: 'Institutional campaigns' }) as HTMLElement;
}

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.mocked(window.matchMedia).mockReset();
    // GSAP's global timeline and ticker are process-wide singletons, so a
    // tween created under fake timers can leave the clock half-scheduled for
    // the next test. Reset both so every test starts from a clean animation
    // clock.
    gsap.globalTimeline.clear();
    gsap.ticker.sleep();
});

describe('campaign carousel', () => {
    it('advances and retreats with the next/previous buttons and announces slide status', () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
        expect(screen.getByText('01 / 03')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: '1 of 3' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
        expect(screen.getByRole('heading', { name: 'Slide two' })).toBeInTheDocument();
        expect(screen.getByText('02 / 03')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: '2 of 3' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
    });

    it('navigates with arrow keys on the carousel region', () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        fireEvent.keyDown(section(), { key: 'ArrowRight' });
        expect(screen.getByRole('heading', { name: 'Slide two' })).toBeInTheDocument();

        fireEvent.keyDown(section(), { key: 'ArrowLeft' });
        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
    });

    it('navigates with a horizontal touch swipe', () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        fireEvent.touchStart(section(), { touches: [{ clientX: 300 }] });
        fireEvent.touchEnd(section(), { changedTouches: [{ clientX: 100 }] });
        expect(screen.getByRole('heading', { name: 'Slide two' })).toBeInTheDocument();

        fireEvent.touchStart(section(), { touches: [{ clientX: 100 }] });
        fireEvent.touchEnd(section(), { changedTouches: [{ clientX: 300 }] });
        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
    });

    it('ignores taps (short touch) as navigation', () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        fireEvent.touchStart(section(), { touches: [{ clientX: 300 }] });
        fireEvent.touchEnd(section(), { changedTouches: [{ clientX: 285 }] });
        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
    });

    it('auto-advances when motion is not reduced', async () => {
        vi.useFakeTimers();
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        await act(async () => {
            vi.advanceTimersByTime(8000);
        });
        expect(screen.getByRole('heading', { name: 'Slide two' })).toBeInTheDocument();
    });

    it('never auto-advances under a reduced-motion preference', async () => {
        vi.useFakeTimers();
        mockReducedMotion(true);
        render(<CampaignCarousel slides={slides} />);

        await act(async () => {
            vi.advanceTimersByTime(32000);
        });
        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
    });

    it('stops auto-advancing when the user pauses, and resumes on demand', async () => {
        vi.useFakeTimers();
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        fireEvent.click(screen.getByRole('button', { name: 'Pause automatic advance' }));
        await act(async () => {
            vi.advanceTimersByTime(32000);
        });
        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Resume automatic advance' }));
        await act(async () => {
            vi.advanceTimersByTime(8000);
        });
        expect(screen.getByRole('heading', { name: 'Slide two' })).toBeInTheDocument();
    });

    it('never auto-advances while an advisory slide is current', async () => {
        vi.useFakeTimers();
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        // Move onto the advisory slide, then let time pass: it must hold.
        fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
        await act(async () => {
            vi.advanceTimersByTime(32000);
        });
        expect(screen.getByRole('heading', { name: 'Slide two' })).toBeInTheDocument();
    });

    it('honours a runtime change to the reduced-motion preference', async () => {
        vi.useFakeTimers();
        const mock = mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        // Flushing the preference change in its own act lets React clear the
        // auto-advance interval before any time is advanced.
        await act(async () => {
            mock.fireChange(true);
        });
        await act(async () => {
            vi.advanceTimersByTime(32000);
        });
        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
    });

    it('keeps a calm, predictable layout for a single slide (no controls, no status)', () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides.slice(0, 1)} />);

        expect(screen.getByRole('heading', { name: 'Slide one' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument();
        expect(screen.queryByRole('group', { name: '1 of 1' })).not.toBeInTheDocument();
    });

    it('navigates with the numbered slide indicators and marks the current one', () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        const indicatorOne = screen.getByRole('button', { name: 'Go to slide 1' });
        expect(indicatorOne).toHaveAttribute('aria-current', 'true');

        fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
        expect(screen.getByRole('heading', { name: 'Slide three' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute('aria-current', 'true');
        expect(indicatorOne).not.toHaveAttribute('aria-current');
    });

    it('settles on the last requested slide when navigation clicks fire rapidly', () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={slides} />);

        fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }));
        fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));

        expect(screen.getByRole('heading', { name: 'Slide three' })).toBeInTheDocument();
        expect(screen.getByText('03 / 03')).toBeInTheDocument();
    });

    it('preloads the next slide media and unmounts the outgoing media once the transition settles', async () => {
        mockReducedMotion(false);
        render(<CampaignCarousel slides={mediaSlides} />);

        // Active + preloaded next, with the rest kept out of the DOM.
        expect(document.querySelector('img[src="/campaigns/one.webp"]')).not.toBeNull();
        expect(document.querySelector('img[src="/campaigns/two.webp"]')).not.toBeNull();
        expect(document.querySelector('img[src="/campaigns/three.webp"]')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
        // Mid-transition the outgoing layer is still mounted alongside active + next.
        expect(document.querySelector('img[src="/campaigns/one.webp"]')).not.toBeNull();

        // Once the transition settles, the outgoing media is unmounted.
        await waitFor(
            () => expect(document.querySelector('img[src="/campaigns/one.webp"]')).toBeNull(),
            { timeout: 5000 },
        );

        // Active + next media remain mounted.
        expect(document.querySelector('img[src="/campaigns/two.webp"]')).not.toBeNull();
        expect(document.querySelector('img[src="/campaigns/three.webp"]')).not.toBeNull();
    });

    it('shows the progress indicator while motion is allowed and hides it under reduced motion', () => {
        mockReducedMotion(false);
        const { container } = render(<CampaignCarousel slides={slides} />);
        expect(container.querySelector('[data-hero-progress]')).not.toBeNull();
        cleanup();

        mockReducedMotion(true);
        const reduced = render(<CampaignCarousel slides={slides} />);
        expect(reduced.container.querySelector('[data-hero-progress]')).toBeNull();
    });
});
