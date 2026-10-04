import { cleanup, render, screen, within } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SiteShell } from './site-shell';

type MenuEntry = {
    label: string;
    href: string;
    sort_order: number;
};

// The shell reads its header navigation from the shared `siteMenu` Inertia prop.
// These hold the same four entries the seeder ships so the shell renders the
// default public site. Tests may override them to simulate CMS changes.
const { publishedMenu, setPublishedMenu } = vi.hoisted(() => {
    const menu: MenuEntry[] = [
        { label: 'About FMCA', href: '/about', sort_order: 1 },
        { label: 'Services', href: '/services', sort_order: 2 },
        { label: 'Patients & Visitors', href: '/patients', sort_order: 3 },
        { label: 'News & Updates', href: '/news', sort_order: 4 },
    ];

    return { publishedMenu: menu, setPublishedMenu: (items: MenuEntry[]) => (menu.length = 0, menu.push(...items)) };
});

// The shell links are Inertia <Link>s; in a unit test we only care about the
// resulting <a href>, so swap the router link for a plain anchor. Wayfinder
// links arrive as route-definition objects ({ url, method }); the mock reads
// their url so assertions target the real target path.
vi.mock('@inertiajs/react', () => ({
    Link: (props: {
        href: string | { url: string; method: string };
        className?: string;
        onClick?: () => void;
        children: React.ReactNode;
    }) =>
        React.createElement(
            'a',
            {
                href: typeof props.href === 'string' ? props.href : props.href.url,
                className: props.className,
                onClick: props.onClick,
            },
            props.children,
        ),
    usePage: () => ({ props: { siteMenu: publishedMenu } }),
}));

beforeEach(() => setPublishedMenu([]));

afterEach(() => cleanup());

describe('site shell pathways (360px)', () => {
    it('routes the mobile quick-nav to real pages, never dead-ending on a hash anchor', () => {
        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        const nav = within(screen.getByRole('navigation', { name: 'Mobile quick navigation' }));

        for (const label of ['Home', 'Services', 'SOS', 'Requests']) {
            const link = nav.getByRole('link', { name: label }) as HTMLAnchorElement;
            expect(link.getAttribute('href')).not.toMatch(/^#/);
        }

        // Emergency is a tel: pathway, the rest are routed (no '#services/#visiting').
        expect(nav.getByRole('link', { name: 'SOS' }).getAttribute('href')).toMatch(/^tel:/);
    });

    it('exposes the four 360px pathways: emergency, services, directions, appointment', () => {
        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        const emergency = screen.getAllByRole('link', { name: /SOS|Emergency contact/i });
        expect(emergency.length).toBeGreaterThan(0);
        for (const link of emergency) {
            expect(link.getAttribute('href')).toMatch(/^tel:/);
        }

        expect(screen.getByRole('link', { name: 'Directions' }).getAttribute('href')).not.toMatch(/^#/);
        for (const link of screen.getAllByRole('link', { name: 'Request an appointment' })) {
            expect(link.getAttribute('href')).not.toMatch(/^#/);
        }
    });

    it('exposes the mobile menu trigger and an accessible skip link', () => {
        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
        expect((screen.getByRole('link', { name: 'Skip to content' }) as HTMLAnchorElement).getAttribute('href')).toBe('#main-content');
    });
});

describe('site shell primary navigation is menu-managed', () => {
    it('renders exactly the published menu items, in their sort order', () => {
        setPublishedMenu([
            { label: 'About FMCA', href: '/about', sort_order: 1 },
            { label: 'Services', href: '/services', sort_order: 2 },
            { label: 'Patients & Visitors', href: '/patients', sort_order: 3 },
            { label: 'News & Updates', href: '/news', sort_order: 4 },
        ]);

        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        const nav = within(screen.getByRole('navigation', { name: 'Primary navigation' }));

        for (const label of ['About FMCA', 'Services', 'Patients & Visitors', 'News & Updates']) {
            const link = nav.getByRole('link', { name: label }) as HTMLAnchorElement;
            expect(link.getAttribute('href')).not.toMatch(/^#/);
        }
    });

    it('renders an item an editor added, in the order the CMS supplies it', () => {
        setPublishedMenu([
            { label: 'News & Updates', href: '/news', sort_order: 1 },
            { label: 'Clinics', href: '/clinics', sort_order: 2 },
        ]);

        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        const nav = within(screen.getByRole('navigation', { name: 'Primary navigation' }));

        expect(nav.getAllByRole('link').map((link) => link.textContent)).toEqual(['News & Updates', 'Clinics']);
        expect(nav.getByRole('link', { name: 'Clinics' }).getAttribute('href')).toBe('/clinics');
    });

    it('renders no primary navigation links when nothing is published', () => {
        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        const nav = within(screen.getByRole('navigation', { name: 'Primary navigation' }));

        expect(nav.queryAllByRole('link')).toHaveLength(0);
    });

    it('offers the same menu items in the mobile sheet', () => {
        setPublishedMenu([{ label: 'Clinics', href: '/clinics', sort_order: 1 }]);

        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        const trigger = screen.getByRole('button', { name: 'Open navigation' });
        trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(screen.getByRole('link', { name: 'Clinics' }).getAttribute('href')).toBe('/clinics');
    });
});

describe('site shell footer legal links', () => {
    it('points the Privacy and Accessibility bottom-bar links at the published statement routes', () => {
        render(<SiteShell><main id="main-content">content</main></SiteShell>);

        const privacy = screen.getByRole('link', { name: 'Privacy' }) as HTMLAnchorElement;
        const accessibility = screen.getByRole('link', { name: 'Accessibility' }) as HTMLAnchorElement;

        // No more dead "#privacy"/"#accessibility" fragment anchors.
        expect(privacy.getAttribute('href')).not.toMatch(/^#/);
        expect(accessibility.getAttribute('href')).not.toMatch(/^#/);

        expect(privacy.getAttribute('href')).toContain('/legal/privacy-statement');
        expect(accessibility.getAttribute('href')).toContain('/legal/accessibility-statement');
    });
});
