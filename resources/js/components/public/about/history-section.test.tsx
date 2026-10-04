import type { InstituteProfile } from '@inertiajs/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveSiteInfo } from '@/lib/site-info';
import { HistorySection } from './history-section';

const baseProfile: InstituteProfile = {
    id: 1,
    status: 'published',
    institutionName: null,
    aboutIntro: null,
    historyBody: null,
    historyMilestones: [],
    visionStatement: null,
    missionStatement: null,
    generalEmail: null,
    generalEmailHref: null,
    generalPhone: null,
    generalPhoneLabel: null,
    generalPhoneHref: null,
    emergencyPhone: null,
    emergencyLabel: null,
    emergencyTel: null,
    campusName: null,
    addressLines: [],
    accessNote: null,
    locationLabel: null,
    locationAddress: null,
    latitude: null,
    longitude: null,
    mapZoom: null,
    mapEmbedUrl: null,
    directionsUrl: null,
    mapAltText: null,
    visitingHours: [],
    visitingPolicyNote: null,
    owner: null,
    reviewedAt: null,
    reviewedAtLabel: null,
};

afterEach(() => {
    cleanup();
});

describe('history section', () => {
    it('renders the saved rich text through the prose styles', () => {
        const { container } = render(
            <HistorySection
                siteInfo={resolveSiteInfo({
                    ...baseProfile,
                    historyBody: '<p><strong>Established in 1991.</strong> The institute opened as a regional referral hospital.</p>',
                })}
            />,
        );

        expect(screen.getByRole('region', { name: 'Who we are' })).toBeInTheDocument();
        expect(container.querySelector('.fmca-prose strong')).not.toBeNull();
        expect(screen.getByText('The institute opened as a regional referral hospital.')).toBeInTheDocument();
    });

    it('renders legacy plain text as paragraphs without interpreting it as markup', () => {
        const { container } = render(
            <HistorySection
                siteInfo={resolveSiteInfo({
                    ...baseProfile,
                    historyBody: 'The institute began with a single ward.\nIt now serves the whole capital territory.',
                })}
            />,
        );

        expect(container.querySelector('.fmca-prose')).toBeNull();
        expect(screen.getByText('The institute began with a single ward.')).toBeInTheDocument();
        expect(screen.getByText('It now serves the whole capital territory.')).toBeInTheDocument();
    });

    it('lists the vision, the mission and the milestone timeline', () => {
        render(
            <HistorySection
                siteInfo={resolveSiteInfo({
                    ...baseProfile,
                    historyBody: '<p>A short narrative.</p>',
                    visionStatement: 'To be a leading tertiary hospital in West Africa.',
                    missionStatement: 'To deliver specialist care to every patient.',
                    historyMilestones: [
                        { year: '1991', title: 'Establishment', body: 'Opened its first ward.' },
                        { year: '2010', title: 'Expansion', body: 'Opened specialist units.' },
                    ],
                })}
            />,
        );

        expect(screen.getByRole('heading', { name: 'Vision' })).toBeInTheDocument();
        expect(screen.getByText('To be a leading tertiary hospital in West Africa.')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Mission' })).toBeInTheDocument();
        expect(screen.getByText('To deliver specialist care to every patient.')).toBeInTheDocument();
        expect(screen.getByText('1991')).toBeInTheDocument();
        expect(screen.getByText('Establishment')).toBeInTheDocument();
        expect(screen.getByText('Opened its first ward.')).toBeInTheDocument();
        expect(screen.getByText('2010')).toBeInTheDocument();
        expect(screen.getByText('Expansion')).toBeInTheDocument();
    });

    it('hides the whole section while the workspace has nothing to say', () => {
        const { container } = render(<HistorySection siteInfo={resolveSiteInfo(null)} />);

        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole('region', { name: 'Who we are' })).not.toBeInTheDocument();
    });

    it('still shows the statements when there is no narrative yet', () => {
        render(
            <HistorySection
                siteInfo={resolveSiteInfo({ ...baseProfile, missionStatement: 'Specialist care for every patient.' })}
            />,
        );

        expect(screen.getByRole('region', { name: 'Who we are' })).toBeInTheDocument();
        expect(screen.getByText('Specialist care for every patient.')).toBeInTheDocument();
    });
});
