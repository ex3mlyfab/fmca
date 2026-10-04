import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            siteMenu: SiteMenuEntry[];
            brandIdentity: Partial<Record<BrandIdentitySlot, BrandAsset | null>>;
            instituteProfile: InstituteProfile | null;
            [key: string]: unknown;
        };
    }

    export interface SiteMenuEntry {
        label: string;
        href: string;
        sort_order: number;
    }

    export type BrandIdentitySlot = 'header_logo' | 'footer_logo' | 'favicon' | 'apple_touch_icon';

    export interface BrandAsset {
        url: string;
        alt: string;
        mime: string;
    }

    /**
     * The published institute profile: about-page history, contact details and
     * campus location. Null until something is published, so consumers fall
     * back to the built-in contact constants in @/lib/contact-info.
     *
     * Mirrors `InstituteProfile::toSiteInfo()`; the phone and email targets are
     * built server-side so the client never composes a tel: or mailto: URL.
     */
    export interface InstituteProfile {
        id: number;
        status: 'draft' | 'published';
        institutionName: string | null;
        aboutIntro: string | null;
        historyBody: string | null;
        historyMilestones: InstituteMilestone[];
        visionStatement: string | null;
        missionStatement: string | null;
        generalEmail: string | null;
        generalEmailHref: string | null;
        generalPhone: string | null;
        generalPhoneLabel: string | null;
        generalPhoneHref: string | null;
        emergencyPhone: string | null;
        emergencyLabel: string | null;
        emergencyTel: string | null;
        campusName: string | null;
        addressLines: string[];
        accessNote: string | null;
        locationLabel: string | null;
        locationAddress: string | null;
        latitude: number | null;
        longitude: number | null;
        mapZoom: number | null;
        mapEmbedUrl: string | null;
        directionsUrl: string | null;
        mapAltText: string | null;
        visitingHours: VisitingHourSlot[];
        visitingPolicyNote: string | null;
        owner: string | null;
        /** ISO date, for the CMS date input. */
        reviewedAt: string | null;
        /** Formatted for display on the public site. */
        reviewedAtLabel: string | null;
    }

    export interface InstituteMilestone {
        year: string | null;
        title: string | null;
        body: string | null;
    }

    export interface VisitingHourSlot {
        dayRange: string;
        morningSlot: string;
        eveningSlot: string;
        status: string;
    }
}
