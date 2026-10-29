import { cleanup, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import Department from './department';

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
    departments: { url: () => '/departments' },
}));

vi.mock('@/routes/services', () => ({
    default: { show: { url: (slug: string) => `/services/${slug}` } },
}));

afterEach(() => cleanup());

it('renders the department description with rich text and images', () => {
    const { container } = render(
        <Department
            department={{
                id: 1,
                name: 'Renal Medicine',
                slug: 'renal-medicine',
                summary: 'Renal care information.',
                description:
                    '<h2>Department overview</h2><p>Care includes <strong>specialist</strong> review.</p><img src="/storage/media/renal-team.jpg" alt="Renal care team">',
                contactPhone: null,
                contactEmail: null,
                owner: null,
                reviewedAt: null,
            }}
            services={[]}
        />,
    );

    expect(screen.getByRole('heading', { name: 'Department overview' })).toBeInTheDocument();
    expect(container.querySelector('.fmca-prose strong')?.textContent).toBe('specialist');
    expect(screen.getByRole('img', { name: 'Renal care team' })).toHaveAttribute(
        'src',
        '/storage/media/renal-team.jpg',
    );
});
