import { usePage } from '@inertiajs/react';
import type { InstituteMilestone, InstituteProfile } from '@inertiajs/core';
import {
    campus,
    contentOwner as fallbackOwner,
    emergency as fallbackEmergency,
    reviewedAt as fallbackReviewedAt,
    visitingPolicyNote as fallbackVisitingPolicyNote,
    visitingSlots,
    type ContactCard,
    type VisitingHourSlot,
} from '@/lib/contact-info';

/**
 * Resolved site information. The CMS institute profile is the source of truth
 * once published; until then every value falls back to the built-in contact
 * constants in @/lib/contact-info, so a site with nothing published renders
 * exactly as it did before this layer existed.
 */
export type ResolvedSiteInfo = {
    /** Whether a published institute profile exists at all. */
    isManaged: boolean;
    institutionName: string;
    aboutIntro: string | null;
    historyBody: string | null;
    historyMilestones: InstituteMilestone[];
    visionStatement: string | null;
    missionStatement: string | null;
    campusName: string;
    addressLines: string[];
    accessNote: string;
    locationLabel: string;
    locationAddress: string;
    emergencyPhone: string;
    emergencyLabel: string;
    emergencyTel: string;
    generalEmail: string | null;
    generalEmailHref: string | null;
    generalPhone: string | null;
    generalPhoneHref: string | null;
    generalPhoneLabel: string | null;
    mapEmbedUrl: string | null;
    mapAltText: string;
    directionsUrl: string;
    visitingHours: VisitingHourSlot[];
    visitingPolicyNote: string;
    contentOwner: string;
    reviewedAt: string;
    contactCards: ContactCard[];
};

/**
 * Resolve a CMS profile against the built-in fallbacks. Pure, so it can be
 * exercised without the Inertia router in tests.
 */
export function resolveSiteInfo(profile: InstituteProfile | null): ResolvedSiteInfo {
    const addressLines = nonEmpty(profile?.addressLines) ?? [campus.addressLine1];

    const visitingHours = nonEmpty(profile?.visitingHours) ?? visitingSlots;

    const mapEmbedUrl = profile?.mapEmbedUrl ?? null;
    const directionsUrl = profile?.directionsUrl ?? campus.gpsUrl;

    return {
        isManaged: profile !== null,
        institutionName: pick(profile?.institutionName) ?? campus.name,
        aboutIntro: profile?.aboutIntro ?? null,
        historyBody: profile?.historyBody ?? null,
        historyMilestones: profile?.historyMilestones ?? [],
        visionStatement: profile?.visionStatement ?? null,
        missionStatement: profile?.missionStatement ?? null,
        campusName: pick(profile?.campusName) ?? campus.name,
        addressLines,
        accessNote: pick(profile?.accessNote) ?? campus.accessNote,
        locationLabel: pick(profile?.locationLabel) ?? campus.name,
        locationAddress: pick(profile?.locationAddress) ?? campus.addressLine1,
        emergencyPhone: pick(profile?.emergencyPhone) ?? emergencyPhoneText,
        emergencyLabel: pick(profile?.emergencyLabel) ?? fallbackEmergency.label,
        emergencyTel: profile?.emergencyTel ?? fallbackEmergency.tel,
        generalEmail: profile?.generalEmail ?? null,
        generalEmailHref: profile?.generalEmailHref ?? null,
        generalPhone: profile?.generalPhone ?? null,
        generalPhoneHref: profile?.generalPhoneHref ?? null,
        generalPhoneLabel: profile?.generalPhoneLabel ?? null,
        mapEmbedUrl,
        mapAltText: pick(profile?.mapAltText) ?? 'Campus location map',
        directionsUrl,
        visitingHours,
        visitingPolicyNote: pick(profile?.visitingPolicyNote) ?? fallbackVisitingPolicyNote,
        contentOwner: pick(profile?.owner) ?? fallbackOwner,
        reviewedAt: pick(profile?.reviewedAt) ?? fallbackReviewedAt,
        contactCards: buildContactCards({
            addressLines,
            accessNote: pick(profile?.accessNote) ?? campus.accessNote,
            emergencyLabel: pick(profile?.emergencyLabel) ?? fallbackEmergency.label,
            emergencyTel: profile?.emergencyTel ?? fallbackEmergency.tel,
            generalEmail: profile?.generalEmail ?? null,
            generalEmailHref: profile?.generalEmailHref ?? null,
            generalPhone: profile?.generalPhone ?? null,
            generalPhoneHref: profile?.generalPhoneHref ?? null,
            generalPhoneLabel: profile?.generalPhoneLabel ?? null,
            directionsUrl,
        }),
    };
}

/**
 * The site-wide contact information for the current page, resolved from the
 * published institute profile shared by the server.
 */
export function useSiteInfo(): ResolvedSiteInfo {
    return resolveSiteInfo(usePage().props.instituteProfile ?? null);
}

/** The emergency line as stored by the CMS, without the tel: prefix. */
const emergencyPhoneText = fallbackEmergency.tel.replace(/^tel:/, '');

type CardInput = {
    addressLines: string[];
    accessNote: string;
    emergencyLabel: string;
    emergencyTel: string;
    generalEmail: string | null;
    generalEmailHref: string | null;
    generalPhone: string | null;
    generalPhoneHref: string | null;
    generalPhoneLabel: string | null;
    directionsUrl: string;
};

/** The feedback form on the contact page, reached when no email is published. */
const FEEDBACK_HREF = '/contact#feedback';

/**
 * The contact cards, rebuilt from the resolved values so that a card only
 * appears when the field behind it has a value. Empty CMS fields therefore
 * hide a card instead of rendering a blank one.
 */
function buildContactCards(input: CardInput): ContactCard[] {
    const cards: ContactCard[] = [
        {
            title: 'Campus address',
            description: [input.addressLines.join(', '), input.accessNote],
            icon: 'pin',
            href: input.directionsUrl,
            hrefLabel: 'Get GPS directions',
            external: true,
        },
    ];

    if (input.generalPhone !== null && input.generalPhoneHref !== null) {
        cards.push({
            title: input.generalPhoneLabel ?? 'General enquiries',
            description: [input.generalPhone],
            icon: 'phone',
            href: input.generalPhoneHref,
            hrefLabel: 'Call now',
        });
    }

    cards.push({
        title: 'Emergency dispatch',
        description: [input.emergencyLabel, 'For urgent medical assistance at the campus.'],
        icon: 'phone',
        href: input.emergencyTel,
        hrefLabel: 'Call now',
    });

    if (input.generalEmail !== null && input.generalEmailHref !== null) {
        cards.push({
            title: 'Write to us',
            description: [input.generalEmail],
            icon: 'message',
            href: input.generalEmailHref,
            hrefLabel: 'Send an email',
        });
    } else {
        cards.push({
            title: 'Write to us',
            description: ['Send general feedback or questions about the FMCA website.'],
            icon: 'message',
            href: FEEDBACK_HREF,
            hrefLabel: 'Use the feedback form',
        });
    }

    return cards;
}

/**
 * A non-blank string, or null. The CMS stores blanks as empty strings, which
 * must not win over a fallback value.
 */
function pick(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
}

function nonEmpty<T>(value: T[] | null | undefined): T[] | null {
    if (value === null || value === undefined || value.length === 0) {
        return null;
    }

    return value;
}
