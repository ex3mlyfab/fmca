import { cleanup, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import Service from './service';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: (props: { href: string; children: React.ReactNode }) =>
        React.createElement('a', { href: props.href }, props.children),
}));

vi.mock('@/components/public/site-shell', () => ({
    SiteShell: (props: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, props.children),
}));

vi.mock('@/routes', () => ({
    services: { url: () => '/services' },
}));

vi.mock('@/routes/services', () => ({
    default: { show: { url: (slug: string) => `/services/${slug}` } },
}));

vi.mock('@/routes/departments', () => ({
    default: { show: { url: (slug: string) => `/departments/${slug}` } },
}));

afterEach(() => cleanup());

it('renders the service description with the rich text viewer', () => {
    const { container } = render(
        <Service
            service={{
                id: 1,
                name: 'Renal Services',
                slug: 'renal-services',
                summary: 'Renal care information.',
                description:
                    '<h2>Service overview</h2><p>Care includes <strong>specialist</strong> review.</p>',
                referralGuidance: null,
                eligibility: null,
                owner: null,
                reviewedAt: null,
                department: null,
            }}
            related={[]}
        />,
    );

    expect(
        screen.getByRole('heading', { name: 'Service overview' }),
    ).toBeInTheDocument();
    expect(container.querySelector('.fmca-prose strong')?.textContent).toBe(
        'specialist',
    );
});
