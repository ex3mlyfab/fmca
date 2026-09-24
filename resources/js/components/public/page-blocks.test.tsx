import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PageBlockView, type PageBlockData } from './page-blocks';

afterEach(() => {
    cleanup();
});

function richTextBlock(content: PageBlockData['content']): PageBlockData {
    return {
        block_key: 'rich_text',
        content,
        sort_order: 0,
    };
}

describe('rich text block', () => {
    it('renders stored html through the brand document styles', () => {
        const { container } = render(
            <PageBlockView
                block={richTextBlock({
                    heading: 'Visiting',
                    body: '<h3>Ward hours</h3><p>Visitors <strong>must</strong> register.</p><a href="/visit">Plan a visit</a>',
                })}
            />,
        );

        expect(screen.getByText('Visiting')).toBeInTheDocument();
        expect(screen.getByText('Ward hours')).toBeInTheDocument();
        expect(container.querySelector('.fmca-prose strong')?.textContent).toBe('must');
        expect(screen.getByRole('link', { name: 'Plan a visit' })).toHaveAttribute('href', '/visit');
    });

    it('keeps legacy plain text bodies printing as escaped paragraphs', () => {
        const { container } = render(<PageBlockView block={richTextBlock({ body: 'First line.\n\nSecond line.' })} />);

        expect(container.querySelector('.fmca-prose')).toBeNull();
        expect(screen.getByText('First line.')).toBeInTheDocument();
        expect(screen.getByText('Second line.')).toBeInTheDocument();
    });

    it('renders nothing when the block has no content', () => {
        const { container } = render(<PageBlockView block={richTextBlock(null)} />);

        expect(container.firstElementChild).toBeNull();
    });
});
