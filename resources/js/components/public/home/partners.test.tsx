import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Partners, type PartnerItem } from './partners';

type MediaQueryMock = {
    fireChange: (query: string, matches: boolean) => void;
};

/**
 * jsdom does not implement MediaQueryList, so the carousel's breakpoint and
 * reduced-motion queries are answered from this table. Passing no flags is a
 * safe default: mobile width, motion allowed.
 */
function mockMediaQueries(flags: { large?: boolean; medium?: boolean; reducedMotion?: boolean } = {}): MediaQueryMock {
    const matches: Record<string, boolean> = {
        '(min-width: 1024px)': flags.large ?? false,
        '(min-width: 640px)': flags.medium ?? false,
        '(prefers-reduced-motion: reduce)': flags.reducedMotion ?? false,
    };
    const listeners: Record<string, Array<(event: MediaQueryListEvent) => void>> = {};

    vi.mocked(window.matchMedia).mockImplementation((query) => ({
        get matches() {
            return matches[query] ?? false;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
            (listeners[query] ??= []).push(listener);
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList));

    return {
        fireChange: (query: string, value: boolean) => {
            matches[query] = value;
            for (const listener of listeners[query] ?? []) {
                listener({ matches: value } as MediaQueryListEvent);
            }
        },
    };
}

function partners(count: number, withWebsite: number[] = []): PartnerItem[] {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: `Partner ${index + 1}`,
        logo: `/storage/media/partners/partner-${index + 1}.svg`,
        websiteUrl: withWebsite.includes(index + 1) ? `https://partner-${index + 1}.example.org` : null,
    }));
}

/**
 * Logos are read by their DOM position: an off-screen slide is aria-hidden,
 * and an aria-hidden element has no queryable accessible name.
 */
function slide(container: HTMLElement, position: number) {
    const slides = [...container.querySelectorAll<HTMLLIElement>('[role="group"]')];
    expect(slides[position]?.getAttribute('aria-label')).toBe(`${position + 1} of ${slides.length}`);
    return slides[position]!;
}

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    // Leave a valid default mock behind rather than resetting to a mock that
    // returns undefined for every query.
    mockMediaQueries();
});

describe('partners home section', () => {
    it('stays out of the page when no partner is published', () => {
        const { container } = render(<Partners />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders every published partner with its logo and the partner count', () => {
        mockMediaQueries();
        render(<Partners partners={partners(2)} />);

        expect(screen.getByRole('heading', { name: 'Partners & collaborations' })).toBeInTheDocument();
        expect(screen.getByText('2 partners')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Partner 1 logo' })).toHaveAttribute('src', '/storage/media/partners/partner-1.svg');
        expect(screen.getByRole('img', { name: 'Partner 2 logo' })).toHaveAttribute('src', '/storage/media/partners/partner-2.svg');
    });

    it('renders a static framed grid with no carousel controls when one group holds every logo', () => {
        mockMediaQueries();
        const { container } = render(<Partners partners={partners(2)} />);

        expect(screen.getByRole('img', { name: 'Partner 1 logo' })).toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Partner logos' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Next partner group' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Previous partner group' })).not.toBeInTheDocument();
        expect(container.querySelectorAll('[role="group"]')).toHaveLength(0);
    });

    it('shows one group of logos and marks the logos that sit outside it', () => {
        mockMediaQueries();
        const { container } = render(<Partners partners={partners(6)} />);

        expect(screen.getByRole('region', { name: 'Partner logos' })).toBeInTheDocument();
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();

        expect(slide(container, 0)).not.toHaveAttribute('aria-hidden');
        expect(slide(container, 0)).not.toHaveAttribute('inert');
        expect(slide(container, 1)).not.toHaveAttribute('aria-hidden');
        expect(slide(container, 2)).toHaveAttribute('aria-hidden', 'true');
        expect(slide(container, 2)).toHaveAttribute('inert');
        expect(slide(container, 5)).toHaveAttribute('aria-hidden', 'true');
    });

    it('scales the track to every group so the logos outside the current group sit outside the frame', () => {
        mockMediaQueries({ large: true });
        const { container } = render(<Partners partners={partners(8)} />);

        const track = container.querySelector('ul') as HTMLElement;
        const cells = [...container.querySelectorAll<HTMLElement>('[role="group"]')];

        // The track box is one group wide and each cell refuses to shrink: let
        // the cells compress and every logo crowds into the frame, so the group
        // outside the viewport would be aria-hidden without ever leaving it.
        expect(track.style.width).toBe('');
        cells.forEach((cell) => {
            expect(cell.className).toContain('shrink-0');
            expect(cell.className).not.toContain('flex-1');
            expect(cell.style.flexBasis).toBe('25%');
        });

        fireEvent.click(screen.getByRole('button', { name: 'Next partner group' }));
        expect(track.style.transform).toBe('translateX(-100%)');
    });

    it('moves between groups with the previous and next controls, tracking the active group', () => {
        mockMediaQueries();
        const { container } = render(<Partners partners={partners(6)} />);

        fireEvent.click(screen.getByRole('button', { name: 'Next partner group' }));
        expect(screen.getByText('Group 2 of 3')).toBeInTheDocument();
        expect(slide(container, 2)).not.toHaveAttribute('aria-hidden');
        expect(slide(container, 3)).not.toHaveAttribute('aria-hidden');
        expect(slide(container, 1)).toHaveAttribute('aria-hidden', 'true');
        expect(slide(container, 4)).toHaveAttribute('aria-hidden', 'true');
        expect(screen.getByRole('button', { name: 'Show group 2 of 3' })).toHaveAttribute('aria-current', 'true');

        fireEvent.click(screen.getByRole('button', { name: 'Previous partner group' }));
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();
        expect(slide(container, 0)).not.toHaveAttribute('aria-hidden');
        expect(screen.getByRole('button', { name: 'Show group 1 of 3' })).toHaveAttribute('aria-current', 'true');
    });

    it('wraps around from the last group back to the first and vice versa', () => {
        mockMediaQueries();
        render(<Partners partners={partners(6)} />);

        fireEvent.click(screen.getByRole('button', { name: 'Show group 3 of 3' }));
        fireEvent.click(screen.getByRole('button', { name: 'Next partner group' }));
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Previous partner group' }));
        expect(screen.getByText('Group 3 of 3')).toBeInTheDocument();
    });

    it('jumps to a group with the group indicators', () => {
        mockMediaQueries();
        const { container } = render(<Partners partners={partners(6)} />);

        fireEvent.click(screen.getByRole('button', { name: 'Show group 3 of 3' }));
        expect(screen.getByText('Group 3 of 3')).toBeInTheDocument();
        expect(slide(container, 4)).not.toHaveAttribute('aria-hidden');
        expect(slide(container, 0)).toHaveAttribute('aria-hidden', 'true');
    });

    it('navigates with the arrow keys on the carousel region', () => {
        mockMediaQueries();
        render(<Partners partners={partners(6)} />);
        const region = screen.getByRole('region', { name: 'Partner logos' });

        fireEvent.keyDown(region, { key: 'ArrowRight' });
        expect(screen.getByText('Group 2 of 3')).toBeInTheDocument();

        fireEvent.keyDown(region, { key: 'ArrowLeft' });
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();
    });

    it('navigates with a horizontal swipe and ignores a tap', () => {
        mockMediaQueries();
        render(<Partners partners={partners(6)} />);
        const region = screen.getByRole('region', { name: 'Partner logos' });

        fireEvent.touchStart(region, { touches: [{ clientX: 300 }] });
        fireEvent.touchEnd(region, { changedTouches: [{ clientX: 100 }] });
        expect(screen.getByText('Group 2 of 3')).toBeInTheDocument();

        fireEvent.touchStart(region, { touches: [{ clientX: 100 }] });
        fireEvent.touchEnd(region, { changedTouches: [{ clientX: 300 }] });
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();

        fireEvent.touchStart(region, { touches: [{ clientX: 300 }] });
        fireEvent.touchEnd(region, { changedTouches: [{ clientX: 285 }] });
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();
    });

    it('advances to the next group on a timer', async () => {
        vi.useFakeTimers();
        mockMediaQueries();
        render(<Partners partners={partners(6)} />);

        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();
        await act(async () => {
            vi.advanceTimersByTime(3500);
        });
        expect(screen.getByText('Group 2 of 3')).toBeInTheDocument();
    });

    it('never advances on a timer when motion is reduced', async () => {
        mockMediaQueries({ reducedMotion: true });
        render(<Partners partners={partners(6)} />);
        vi.useFakeTimers();

        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();
        await act(async () => {
            vi.advanceTimersByTime(14000);
        });
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();
    });

    it('pauses automatic advance with the pause control and resumes on demand', async () => {
        vi.useFakeTimers();
        mockMediaQueries();
        render(<Partners partners={partners(6)} />);

        fireEvent.click(screen.getByRole('button', { name: 'Pause automatic advance' }));
        await act(async () => {
            vi.advanceTimersByTime(14000);
        });
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Resume automatic advance' }));
        await act(async () => {
            vi.advanceTimersByTime(3500);
        });
        expect(screen.getByText('Group 2 of 3')).toBeInTheDocument();
    });

    it('pauses automatic advance while the carousel is hovered and resumes when the pointer leaves', async () => {
        vi.useFakeTimers();
        mockMediaQueries();
        render(<Partners partners={partners(6)} />);
        const region = screen.getByRole('region', { name: 'Partner logos' });

        fireEvent.mouseEnter(region);
        await act(async () => {
            vi.advanceTimersByTime(14000);
        });
        expect(screen.getByText('Group 1 of 3')).toBeInTheDocument();

        fireEvent.mouseLeave(region);
        await act(async () => {
            vi.advanceTimersByTime(3500);
        });
        expect(screen.getByText('Group 2 of 3')).toBeInTheDocument();
    });

    it('links a logo to its website in a new tab and renders no link without one', () => {
        mockMediaQueries();
        render(<Partners partners={partners(3, [1, 3])} />);

        const link = screen.getByRole('link', { name: 'Partner 1' }) as HTMLAnchorElement;
        expect(link).toHaveAttribute('href', 'https://partner-1.example.org');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link.rel).toContain('noopener');
        expect(link.rel).toContain('noreferrer');

        expect(screen.queryByRole('link', { name: 'Partner 2' })).not.toBeInTheDocument();
    });

    it('shows four logos per group on a desktop viewport and three on a tablet viewport', () => {
        mockMediaQueries({ large: true });
        const { container } = render(<Partners partners={partners(8)} />);

        expect(screen.getByText('Group 1 of 2')).toBeInTheDocument();
        expect(slide(container, 3)).not.toHaveAttribute('aria-hidden');
        expect(slide(container, 4)).toHaveAttribute('aria-hidden', 'true');

        cleanup();
        mockMediaQueries({ medium: true });
        const { container: tablet } = render(<Partners partners={partners(6)} />);

        expect(screen.getByText('Group 1 of 2')).toBeInTheDocument();
        expect(slide(tablet, 2)).not.toHaveAttribute('aria-hidden');
        expect(slide(tablet, 3)).toHaveAttribute('aria-hidden', 'true');
    });

    it('reclaims the group index when a wider viewport leaves fewer groups', async () => {
        const media = mockMediaQueries();
        const { container } = render(<Partners partners={partners(8)} />);
        expect(screen.getByText('Group 1 of 4')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Next partner group' }));
        fireEvent.click(screen.getByRole('button', { name: 'Next partner group' }));
        fireEvent.click(screen.getByRole('button', { name: 'Next partner group' }));
        expect(screen.getByText('Group 4 of 4')).toBeInTheDocument();

        // Two groups of four cover the same eight logos, so the fourth mobile
        // group no longer exists and the index is clamped.
        await act(async () => {
            media.fireChange('(min-width: 1024px)', true);
        });
        expect(screen.getByText('Group 2 of 2')).toBeInTheDocument();
        expect(slide(container, 7)).not.toHaveAttribute('aria-hidden');
    });
});
