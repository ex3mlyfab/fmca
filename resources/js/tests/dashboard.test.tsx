import { cleanup, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Dashboard from '@/pages/dashboard';

// The dashboard only cares about the <a href> the Inertia router would produce.
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: (props: {
        href: string | { url: string; method: string };
        className?: string;
        children?: React.ReactNode;
    }) =>
        React.createElement(
            'a',
            { href: typeof props.href === 'string' ? props.href : props.href?.url },
            props.children,
        ),
}));

const baseProps = {
    userName: 'Test',
    content: [
        { type: 'departments', label: 'Departments', slug: 'departments', total: 4, published: 4, review: 0, pending: 0 },
        { type: 'news', label: 'News', slug: 'news', total: 0, published: 0, review: 0, pending: 0 },
    ],
    publishedTotal: 4,
    reviewTotal: 0,
    mediaAssets: 0,
    activeCampaigns: 0,
    pendingReview: [],
    appointmentRequests: { newCount: 0, items: [] },
    contactSubmissions: { newCount: 0, items: [] },
    activity: [],
};

afterEach(() => cleanup());

describe('dashboard card grid', () => {
    it('gives the wide content and activity cards their lg:col-span-2 class so each row fills the grid width', () => {
        render(<Dashboard {...baseProps} />);

        const contentMix = screen.getByRole('heading', { name: 'Content mix' }).closest('section');
        const activityFeed = screen.getByRole('heading', { name: 'Recent activity' }).closest('section');

        // Without the class applied these rows occupy two of three columns and the
        // cards stop short of the stat row's right edge.
        expect(contentMix?.getAttribute('class')).toContain('lg:col-span-2');
        expect(activityFeed?.getAttribute('class')).toContain('lg:col-span-2');
    });
});
