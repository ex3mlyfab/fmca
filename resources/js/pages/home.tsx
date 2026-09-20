import { Head } from '@inertiajs/react';
import { SiteShell } from '@/components/public/site-shell';
import {
    CampaignCarousel,
    CampusAccess,
    CentresOfExcellence,
    EmergencyBanner,
    EmergencyHotbar,
    InstitutionalStrength,
    InsuranceGuidance,
    MetricStrip,
    OperationalStatusStrip,
    QuickServices,
} from '@/components/public/home';

type HomeConfigurationData = {
    emergency?: {
        message?: string;
        phone?: string;
        phoneLabel?: string;
    };
    status?: {
        campusStatus?: string;
        serviceDesk?: string;
        reviewStatus?: string;
    };
};

type CampaignSlide = {
    id: number;
    title: string;
    copy: string;
    eyebrow?: string | null;
    image?: string | null;
    mobileImage?: string | null;
    imageAlt?: string | null;
    focalPoint?: string | null;
    videoPoster?: string | null;
    primaryCtaLabel?: string | null;
    primaryCtaHref?: string | null;
    secondaryCtaLabel?: string | null;
    secondaryCtaHref?: string | null;
    owner?: string | null;
    advisory?: boolean;
    overlayIntensity?: number | null;
};

type HomeProps = {
    configuration?: HomeConfigurationData;
    campaigns?: CampaignSlide[];
};

export default function Home({ configuration, campaigns = [] }: HomeProps) {
    const emergencyConfig = configuration?.emergency;
    const statusConfig = configuration?.status;

    return (
        <SiteShell>
            <Head title="Federal Medical Centre, Abuja | Tertiary Care & Clinical Governance" />
            <main id="main-content">
                {/* 1 & 2: Government Utility & Header are managed in SiteShell */}

                {/* 3: Emergency Hotbar */}
                <EmergencyHotbar
                    message={emergencyConfig?.message}
                    phone={emergencyConfig?.phone}
                    phoneLabel={emergencyConfig?.phoneLabel}
                />

                {/* 4: Operational Status Strip */}
                <OperationalStatusStrip
                    campusStatus={statusConfig?.campusStatus}
                    serviceDesk={statusConfig?.serviceDesk}
                    reviewStatus={statusConfig?.reviewStatus}
                />

                {/* 5: Campaign Hero Carousel (CMS-managed content module) */}
                <CampaignCarousel slides={campaigns} />

                {/* 6: Immediate Patient Services (Two-Tier Asymmetric Layout) */}
                <QuickServices />

                {/* 7: Institutional Capacity & Trust Metrics */}
                <MetricStrip />

                {/* 8: Insurance Guidance & NHIA Support */}
                <InsuranceGuidance />

                {/* 9: Centres of Clinical Excellence */}
                <CentresOfExcellence />

                {/* 10: Academic Mandate & Institutional Strength */}
                <InstitutionalStrength />

                {/* 11: Campus Access & Visiting Hours */}
                <CampusAccess />

                {/* 12: Final Emergency Dispatch Callout */}
                <EmergencyBanner
                    phone={emergencyConfig?.phone}
                />

                {/* 13: Footer is managed in SiteShell */}
            </main>
        </SiteShell>
    );
}
