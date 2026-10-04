import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RecentNews, type RecentNewsItem } from './recent-news';

afterEach(() => {
    cleanup();
});

const sampleNews: RecentNewsItem[] = [
    {
        id: 1,
        title: 'Outpatient clinic schedule update',
        slug: 'outpatient-clinic-schedule-update',
        summary: 'A short summary of the schedule update.',
        featureImage: '/media/2026/09/clinic.jpg',
        featureImageAlt: 'The outpatient clinic',
        publishDate: '2 Sep 2026',
        category: { name: 'Public Notice', slug: 'public-notices' },
    },
    {
        id: 2,
        title: 'New health advisory issued',
        slug: 'new-health-advisory',
        summary: 'A short summary of the advisory.',
        featureImage: null,
        featureImageAlt: null,
        publishDate: '1 Sep 2026',
        category: null,
    },
];

describe('recent news', () => {
    it('renders a card that links to each article', () => {
        render(<RecentNews news={sampleNews} />);

        const articleLinks = screen
            .getAllByRole('link')
            .filter((link) => link.getAttribute('href')?.startsWith('/news/'));

        expect(articleLinks).toHaveLength(2);
        expect(articleLinks[0]).toHaveAttribute('href', '/news/outpatient-clinic-schedule-update');
        expect(screen.getByRole('link', { name: /view all news/i })).toHaveAttribute('href', '/news');
    });

    it('shows a category badge, date and the feature image when present', () => {
        render(<RecentNews news={sampleNews} />);

        expect(screen.getByText('Public Notice')).toBeInTheDocument();
        expect(screen.getByText('2 Sep 2026')).toBeInTheDocument();

        const image = screen.getByRole('img', { name: 'The outpatient clinic' });
        expect(image).toHaveAttribute('src', '/media/2026/09/clinic.jpg');
    });

    it('falls back to a placeholder when a post has no feature image', () => {
        render(<RecentNews news={sampleNews.slice(1)} />);

        expect(screen.queryByRole('img')).toBeNull();
        expect(screen.getByText('New health advisory issued')).toBeInTheDocument();
    });

    it('shows an empty state when there is no published news', () => {
        render(<RecentNews />);

        expect(screen.getByText(/new items will appear here/i)).toBeInTheDocument();
    });
});
