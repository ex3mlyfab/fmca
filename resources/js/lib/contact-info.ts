// Single source of owner-approved campus and contact constants, shared by the
// public home "Campus access & wayfinding" block (components/public/home/campus-access.tsx)
// and the fixed /contact view. There is no CMS model yet, so keep these values
// in sync with the FMCA communications desk here, then rebuild.
//
// Values are placeholders reused from the existing codebase (address, GPS link,
// emergency line). Do not invent new numbers or emails.

export type VisitingHourSlot = {
    dayRange: string;
    morningSlot: string;
    eveningSlot: string;
    status: string;
};

export const visitingSlots: VisitingHourSlot[] = [
    { dayRange: 'Monday - Friday', morningSlot: '06:30 - 07:30', eveningSlot: '16:30 - 18:30', status: 'General wards' },
    { dayRange: 'Weekends & Public Holidays', morningSlot: '11:00 - 13:00', eveningSlot: '16:00 - 18:30', status: 'General wards' },
    { dayRange: 'Intensive Care & High Dependency', morningSlot: 'Restricted', eveningSlot: '17:00 - 18:00', status: 'Immediate family only' },
];

export const visitingPolicyNote =
    'Maximum 2 visitors per patient bed at any one time. Children under 12 years are restricted from inpatient wards for clinical safety.';

export const campus = {
    name: 'Federal Medical Centre, Abuja',
    shortName: 'FMCA',
    addressLine1: 'Plot 1202, Cadastral Zone, FCT Abuja, Nigeria',
    accessNote: 'Main gate: 24/7 emergency vehicle corridor',
    gpsUrl: 'https://maps.google.com',
};

export const emergency = {
    tel: 'tel:+2340000000000',
    label: 'Verified dispatch line',
};

export type ContactCard = {
    title: string;
    description: string[];
    icon: 'pin' | 'phone' | 'message';
    href: string;
    hrefLabel: string;
    external?: boolean;
};

export const contactCards: ContactCard[] = [
    {
        title: 'Campus address',
        description: [campus.addressLine1, campus.accessNote],
        icon: 'pin',
        href: campus.gpsUrl,
        hrefLabel: 'Get GPS directions',
        external: true,
    },
    {
        title: 'Emergency dispatch',
        description: [emergency.label, 'For urgent medical assistance at the campus.'],
        icon: 'phone',
        href: emergency.tel,
        hrefLabel: 'Call now',
    },
    {
        title: 'Write to us',
        description: ['Send general feedback or questions about the FMCA website.'],
        icon: 'message',
        href: '#feedback',
        hrefLabel: 'Use the feedback form',
    },
];

export const contentOwner = 'FMCA Communications & Clinical desks';

export const reviewedAt = 'September 2026';
