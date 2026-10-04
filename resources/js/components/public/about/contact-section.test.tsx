import type { InstituteProfile } from '@inertiajs/core';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveSiteInfo } from '@/lib/site-info';
import { ContactSection } from './contact-section';

const publishedProfile: InstituteProfile = {
    id: 1,
    status: 'published',
    institutionName: null,
    aboutIntro: null,
    historyBody: null,
    historyMilestones: [],
    visionStatement: null,
    missionStatement: null,
    generalEmail: 'info@fmca.example',
    generalEmailHref: 'mailto:info@fmca.example',
    generalPhone: null,
    generalPhoneLabel: null,
    generalPhoneHref: null,
    emergencyPhone: '08000000001',
    emergencyLabel: 'Verified dispatch line',
    emergencyTel: 'tel:08000000001',
    campusName: 'FMCA Campus',
    addressLines: ['Plot 776', 'Jabi Road, Abuja'],
    accessNote: 'Enter from Jabi Road.',
    locationLabel: 'Location',
    locationAddress: 'Jabi Road, Abuja, Nigeria',
    latitude: null,
    longitude: null,
    mapZoom: null,
    mapEmbedUrl: null,
    directionsUrl: null,
    mapAltText: null,
    visitingHours: [
        { dayRange: 'Monday - Friday', morningSlot: '9:00 - 11:00', eveningSlot: '3:00 - 5:00', status: 'General wards' },
        { dayRange: 'Intensive Care', morningSlot: 'Restricted', eveningSlot: '17:00 - 18:00', status: 'Immediate family only' },
    ],
    visitingPolicyNote: 'Maximum two visitors per bed at any one time.',
    owner: 'FMCA Corporate Communications',
    reviewedAt: 'August 2026',
    reviewedAtLabel: 'August 2026',
};

afterEach(() => {
    cleanup();
});

describe('contact section', () => {
    it('shows the managed emergency line, contact cards and visiting hours', () => {
        render(<ContactSection siteInfo={resolveSiteInfo(publishedProfile)} />);

        expect(screen.getByRole('region', { name: 'Contact details' })).toBeInTheDocument();

        const dispatch = screen.getByRole('link', { name: 'call now' });
        expect(dispatch).toHaveAttribute('href', 'tel:08000000001');
        expect(screen.getByText(/For urgent medical assistance, use the/)).toBeInTheDocument();

        expect(screen.getByText('Campus address')).toBeInTheDocument();
        expect(screen.getByText('Write to us')).toBeInTheDocument();
        expect(screen.getByText('info@fmca.example')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /send an email/i })).toHaveAttribute('href', 'mailto:info@fmca.example');

        expect(screen.getByRole('heading', { name: 'Ward visiting schedule', level: 3 })).toBeInTheDocument();
        expect(screen.getByText('Monday - Friday')).toBeInTheDocument();
        expect(screen.getByText('9:00 - 11:00')).toBeInTheDocument();
        expect(screen.getByText('General wards')).toBeInTheDocument();
        expect(screen.getByText('Intensive Care')).toBeInTheDocument();
        expect(screen.getByText(/maximum two visitors per bed/i)).toBeInTheDocument();
    });

    it('records who keeps the page accurate', () => {
        render(<ContactSection siteInfo={resolveSiteInfo(publishedProfile)} />);

        expect(screen.getByText(/Last reviewed by FMCA Corporate Communications/)).toBeInTheDocument();
        expect(screen.getByText(/August 2026/)).toBeInTheDocument();
    });

    it('falls back to the built-in contact constants while nothing is published', () => {
        render(<ContactSection siteInfo={resolveSiteInfo(null)} />);

        expect(screen.getByRole('link', { name: 'call now' })).toHaveAttribute('href', 'tel:+2340000000000');

        // Without a published email the feedback form stands in for it.
        expect(screen.getByRole('link', { name: /use the feedback form/i })).toHaveAttribute('href', '/contact#feedback');
        expect(screen.queryByText('info@fmca.example')).not.toBeInTheDocument();

        expect(screen.getByText('Plot 1202, Cadastral Zone, FCT Abuja, Nigeria')).toBeInTheDocument();
        expect(screen.getByText('Main gate: 24/7 emergency vehicle corridor')).toBeInTheDocument();
    });
});
