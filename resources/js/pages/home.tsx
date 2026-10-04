import { Head } from '@inertiajs/react';
import { SiteShell } from '@/components/public/site-shell';
import {
    CampaignCarousel,
    CampusAccess,
    CentresOfExcellence,
    EmergencyBanner,
    EmergencyHotbar,
    InstituteOverview,
    InstitutionalStrength,
    InsuranceGuidance,
    MetricStrip,
    OperationalStatusStrip,
    Partners,
    QuickServices,
    RecentNews,
    type PartnerItem,
    type RecentNewsItem,
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
    news?: RecentNewsItem[];
    partners?: PartnerItem[];
};

export default function Home({ configuration, campaigns = [], news = [], partners = [] }: HomeProps) {
    const emergencyConfig = configuration?.emergency;
    const statusConfig = configuration?.status;

    return (
        <SiteShell>
            <Head title="Federal Medical Centre, Abuja | Tertiary Care & Clinical Governance" />
            <main id="main-content">
                {/* 1 & 2: Government Utility & Header are managed in SiteShell */}

                {/* 3: Emergency Hotbar 
                <EmergencyHotbar
                    message={emergencyConfig?.message}
                    phone={emergencyConfig?.phone}
                    phoneLabel={emergencyConfig?.phoneLabel}
                />*/}

                {/* 4: Operational Status Strip 
                <OperationalStatusStrip
                    campusStatus={statusConfig?.campusStatus}
                    serviceDesk={statusConfig?.serviceDesk}
                    reviewStatus={statusConfig?.reviewStatus}
                />
*/}
                {/* 5: Campaign Hero Carousel (CMS-managed content module) */}
                <CampaignCarousel slides={campaigns} />

                {/* 6: Institute Overview - History, Vision & Mission beside the Medical Director */}
                <InstituteOverview />

                {/* 7: Immediate Patient Services (Two-Tier Asymmetric Layout) */}
                <QuickServices />

                {/* 8: Institutional Capacity & Trust Metrics */}
                <MetricStrip />

                {/* 9: Insurance Guidance & NHIA Support */}
                <InsuranceGuidance />

                {/* 10: Centres of Clinical Excellence */}
                <CentresOfExcellence />

                {/* 11: Academic Mandate & Institutional Strength */}
                <InstitutionalStrength />

                {/* 12: Campus Access & Visiting Hours */}
                <CampusAccess />

                {/* 13: Recent news & updates (CMS-managed news feed) */}
                <RecentNews news={news} />

                {/* 14: Partners & collaborations (CMS-managed partner logos) */}
                <Partners partners={partners} />

                {/* 15: Final Emergency Dispatch Callout */}
                <EmergencyBanner
                    phone={emergencyConfig?.phone}
                />

                {/* 14: Footer is managed in SiteShell */}
            </main>
        </SiteShell>
    );
}
