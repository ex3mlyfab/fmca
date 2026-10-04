import type { InstituteProfile } from '@inertiajs/core';
import { campus, contentOwner, emergency, visitingSlots, visitingPolicyNote } from '@/lib/contact-info';
import { describe, expect, it } from 'vitest';
import { resolveSiteInfo } from './site-info';

function makeProfile(overrides: Partial<InstituteProfile> = {}): InstituteProfile {
    return {
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
        ...overrides,
    };
}

describe('resolveSiteInfo', () => {
    it('falls back to the built-in contact constants when nothing is published', () => {
        const siteInfo = resolveSiteInfo(null);

        expect(siteInfo.isManaged).toBe(false);
        expect(siteInfo.institutionName).toBe(campus.name);
        expect(siteInfo.campusName).toBe(campus.name);
        expect(siteInfo.addressLines).toEqual([campus.addressLine1]);
        expect(siteInfo.accessNote).toBe(campus.accessNote);
        expect(siteInfo.emergencyPhone).toBe(emergency.tel.replace(/^tel:/, ''));
        expect(siteInfo.emergencyLabel).toBe(emergency.label);
        expect(siteInfo.emergencyTel).toBe(emergency.tel);
        expect(siteInfo.visitingHours).toEqual(visitingSlots);
        expect(siteInfo.visitingPolicyNote).toBe(visitingPolicyNote);
        expect(siteInfo.contentOwner).toBe(contentOwner);
        expect(siteInfo.mapEmbedUrl).toBeNull();
        expect(siteInfo.directionsUrl).toBe(campus.gpsUrl);
    });

    it('lets managed values win once a profile is published', () => {
        const siteInfo = resolveSiteInfo(
            makeProfile({
                institutionName: 'Federal Medical Centre Abuja',
                aboutIntro: 'A tertiary healthcare provider.',
                historyBody: '<p>The institute opened in 1991.</p>',
                historyMilestones: [{ year: '1991', title: 'Establishment', body: 'Opened its first ward.' }],
                visionStatement: 'A leading tertiary hospital.',
                missionStatement: 'Specialist care for every patient.',
                generalEmail: 'info@fmca.example',
                generalEmailHref: 'mailto:info@fmca.example',
                generalPhone: '08000000002',
                generalPhoneLabel: 'Switchboard',
                generalPhoneHref: 'tel:08000000002',
                emergencyPhone: '08000000001',
                emergencyLabel: 'Verified dispatch line',
                emergencyTel: 'tel:08000000001',
                campusName: 'FMCA Campus',
                addressLines: ['Plot 776', 'Jabi Road, Abuja'],
                accessNote: 'Enter from Jabi Road.',
                locationLabel: 'Location',
                locationAddress: 'Jabi Road, Abuja',
                mapEmbedUrl: 'https://www.openstreetmap.org/export/embed.html',
                directionsUrl: 'https://www.openstreetmap.org/?mlat=13.0827&mlon=8.6753',
                mapAltText: 'Map showing the FMCA campus',
                visitingHours: [{ dayRange: 'Monday - Friday', morningSlot: '9:00 - 11:00', eveningSlot: '3:00 - 5:00', status: 'General wards' }],
                visitingPolicyNote: 'Ward visits follow infection control rules.',
                owner: 'FMCA Corporate Communications',
                reviewedAt: 'August 2026',
            }),
        );

        expect(siteInfo.isManaged).toBe(true);
        expect(siteInfo.institutionName).toBe('Federal Medical Centre Abuja');
        expect(siteInfo.campusName).toBe('FMCA Campus');
        expect(siteInfo.addressLines).toEqual(['Plot 776', 'Jabi Road, Abuja']);
        expect(siteInfo.emergencyTel).toBe('tel:08000000001');
        expect(siteInfo.generalEmail).toBe('info@fmca.example');
        expect(siteInfo.mapEmbedUrl).toBe('https://www.openstreetmap.org/export/embed.html');
        expect(siteInfo.mapAltText).toBe('Map showing the FMCA campus');
        expect(siteInfo.visitingHours).toHaveLength(1);
        expect(siteInfo.visitingHours[0]?.dayRange).toBe('Monday - Friday');
        expect(siteInfo.contentOwner).toBe('FMCA Corporate Communications');
        expect(siteInfo.reviewedAt).toBe('August 2026');
        expect(siteInfo.visitingPolicyNote).toBe('Ward visits follow infection control rules.');
    });

    it('never lets a blank CMS value win over a fallback', () => {
        const siteInfo = resolveSiteInfo(
            makeProfile({
                institutionName: '   ',
                emergencyPhone: '',
                emergencyLabel: '  ',
                // The model turns a blank emergency phone into null, so the
                // emergency line always falls back rather than going silent.
                emergencyTel: null,
                accessNote: '',
                mapAltText: '',
                visitingPolicyNote: '',
                owner: '   ',
                reviewedAt: '',
            }),
        );

        expect(siteInfo.institutionName).toBe(campus.name);
        expect(siteInfo.emergencyPhone).toBe(emergency.tel.replace(/^tel:/, ''));
        expect(siteInfo.emergencyLabel).toBe(emergency.label);
        expect(siteInfo.emergencyTel).toBe(emergency.tel);
        expect(siteInfo.accessNote).toBe(campus.accessNote);
        expect(siteInfo.mapAltText).toBe('Campus location map');
        expect(siteInfo.visitingPolicyNote).toBe(visitingPolicyNote);
        expect(siteInfo.contentOwner).toBe(contentOwner);
    });

    it('falls back when a CMS list is empty', () => {
        const siteInfo = resolveSiteInfo(makeProfile({ addressLines: [], visitingHours: [] }));

        expect(siteInfo.addressLines).toEqual([campus.addressLine1]);
        expect(siteInfo.visitingHours).toEqual(visitingSlots);
    });

    it('keeps the three legacy cards when no switchboard or email is published', () => {
        const cards = resolveSiteInfo(null).contactCards;

        expect(cards.map((card) => card.title)).toEqual(['Campus address', 'Emergency dispatch', 'Write to us']);
        expect(cards.map((card) => card.href)).toEqual([
            campus.gpsUrl,
            emergency.tel,
            '/contact#feedback',
        ]);
        expect(cards[0]?.external).toBe(true);
        expect(cards[0]?.description).toEqual([campus.addressLine1, campus.accessNote]);
    });

    it('adds a switchboard card and an email card only when both values are present', () => {
        const withBoth = resolveSiteInfo(
            makeProfile({
                generalEmail: 'info@fmca.example',
                generalEmailHref: 'mailto:info@fmca.example',
                generalPhone: '08000000002',
                generalPhoneLabel: 'Switchboard',
                generalPhoneHref: 'tel:08000000002',
            }),
        ).contactCards;

        expect(withBoth.map((card) => card.title)).toEqual([
            'Campus address',
            'Switchboard',
            'Emergency dispatch',
            'Write to us',
        ]);
        expect(withBoth.map((card) => card.href)).toContain('tel:08000000002');
        expect(withBoth.map((card) => card.href)).toContain('mailto:info@fmca.example');

        // An email without its mailto target, or a phone without its tel target,
        // hides the card rather than rendering one with a broken link.
        const halfCoded = resolveSiteInfo(
            makeProfile({ generalEmail: 'info@fmca.example', generalPhone: '08000000002' }),
        ).contactCards;

        expect(halfCoded.map((card) => card.title)).toEqual(['Campus address', 'Emergency dispatch', 'Write to us']);
    });
});
