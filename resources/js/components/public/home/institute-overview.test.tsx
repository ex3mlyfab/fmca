import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { InstituteOverview } from './institute-overview';

afterEach(() => {
    cleanup();
});

describe('institute overview', () => {
    it('renders the history, vision and mission narrative', () => {
        render(<InstituteOverview />);

        expect(
            screen.getByRole('region', { name: 'Our story and the people who lead it' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'History', level: 3 })).toBeInTheDocument();
        expect(screen.getByText(/federal tertiary mandate/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Vision', level: 4 })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Mission', level: 4 })).toBeInTheDocument();
    });

    it('presents the medical director with the leadership link', () => {
        render(<InstituteOverview />);

        expect(screen.getByRole('heading', { name: 'Medical Director', level: 3 })).toBeInTheDocument();

        expect(
            screen.getByRole('link', { name: /top management committee/i }),
        ).toHaveAttribute('href', '/about/leadership');
    });

    it('keeps a portrait placeholder until an approved portrait is supplied', () => {
        const { container } = render(<InstituteOverview />);

        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('Portrait to be confirmed')).toBeInTheDocument();
    });

    it('renders a supplied name, title and portrait, and drops the placeholder note', () => {
        render(
            <InstituteOverview
                leadName="Prof. Example Director"
                leadRole="Federal Executive Director"
                leadPortrait="/media/medical-director.webp"
            />,
        );

        const portrait = screen.getByRole('img', { name: 'Portrait of the Medical Director' });
        expect(portrait).toHaveAttribute('src', '/media/medical-director.webp');
        expect(portrait.parentElement).toHaveClass('min-h-[18rem]', 'lg:min-h-[26rem]');
        expect(screen.getByText('Federal Executive Director')).toBeInTheDocument();
        expect(screen.queryByText('Portrait to be confirmed')).not.toBeInTheDocument();
    });

    it('stacks as a single column by default and splits into two equal halves at lg', () => {
        const { container } = render(<InstituteOverview />);

        const halves = container.querySelector('[class*="lg:grid-cols-2"]');
        expect(halves).not.toBeNull();

        // Token-exact: the unscoped two-column breakpoint must not be present,
        // only the lg-scoped one.
        const classes = halves?.getAttribute('class')?.split(/\s+/) ?? [];
        expect(classes).toContain('lg:grid-cols-2');
        expect(classes).not.toContain('grid-cols-2');
        expect(container.querySelectorAll('article')).toHaveLength(2);
    });
});
