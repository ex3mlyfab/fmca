import type { InstituteProfile } from '@inertiajs/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveSiteInfo } from '@/lib/site-info';
import { MapSection } from './map-section';

const publishedProfile: InstituteProfile = {
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
    campusName: 'FMCA Campus',
    addressLines: ['Plot 776', 'Jabi Road, Abuja'],
    accessNote: 'Enter from Jabi Road, opposite the roundabout.',
    locationLabel: 'Location',
    locationAddress: 'Jabi Road, Abuja, Nigeria',
    latitude: 13.0827,
    longitude: 8.6753,
    mapZoom: 16,
    mapEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=8.67%2C13.08%2C8.68%2C13.09',
    directionsUrl: 'https://www.openstreetmap.org/?mlat=13.082700&mlon=8.675300',
    mapAltText: 'Map showing the FMCA campus on Jabi Road',
    visitingHours: [],
    visitingPolicyNote: null,
    owner: null,
    reviewedAt: null,
    reviewedAtLabel: null,
};

afterEach(() => {
    cleanup();
});

describe('map section', () => {
    it('embeds the campus map with an accessible title when a URL is published', () => {
        const { container } = render(<MapSection siteInfo={resolveSiteInfo(publishedProfile)} />);

        const region = screen.getByRole('region', { name: 'Finding the campus' });
        expect(region).toBeInTheDocument();

        const frame = container.querySelector('iframe');
        expect(frame).not.toBeNull();
        expect(frame).toHaveAttribute('title', 'Map showing the FMCA campus on Jabi Road');
        expect(frame).toHaveAttribute('src', publishedProfile.mapEmbedUrl);
        expect(frame).toHaveAttribute('loading', 'lazy');
    });

    it('shows the address placeholder instead of an empty frame while the map is unpublished', () => {
        const { container } = render(
            <MapSection siteInfo={resolveSiteInfo({ ...publishedProfile, mapEmbedUrl: null })} />,
        );

        expect(container.querySelector('iframe')).toBeNull();
        expect(screen.getByText(/the interactive campus map is not published yet/i)).toBeInTheDocument();
    });

    it('always gives the visitor the address, the access note and a directions link', () => {
        const { container } = render(
            <MapSection siteInfo={resolveSiteInfo({ ...publishedProfile, mapEmbedUrl: null })} />,
        );

        expect(screen.getByText('FMCA Campus')).toBeInTheDocument();
        expect(screen.getByText('Plot 776, Jabi Road, Abuja')).toBeInTheDocument();
        expect(screen.getByText(/opposite the roundabout/i)).toBeInTheDocument();

        const directions = screen.getByRole('link', { name: /get directions/i });
        expect(directions).toHaveAttribute('href', publishedProfile.directionsUrl);
        expect(directions).toHaveAttribute('target', '_blank');
    });

    it('uses the built-in campus values when nothing is published', () => {
        render(<MapSection siteInfo={resolveSiteInfo(null)} />);

        expect(screen.getByRole('link', { name: /get directions/i })).toHaveAttribute('href', 'https://maps.google.com');
    });
});
