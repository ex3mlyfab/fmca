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
    hero?: {
        title?: string;
        summary?: string;
        image?: string;
    };
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
    campaigns?: Array<{
        eyebrow?: string;
        title: string;
        copy: string;
        image?: string;
        primaryCtaLabel?: string;
        primaryCtaHref?: string;
    }>;
};

type HomeProps = {
    configuration?: HomeConfigurationData;
};

export default function Home({ configuration }: HomeProps) {
    const heroConfig = configuration?.hero;
    const emergencyConfig = configuration?.emergency;
    const statusConfig = configuration?.status;

    // Construct campaign slides, incorporating CMS hero draft if present
    const slides = configuration?.campaigns ?? (heroConfig?.title
        ? [
            {
                eyebrow: 'Institutional Care & Public Service',
                title: heroConfig.title,
                copy: heroConfig.summary ?? 'Clear clinical guidance for patients, families and referring clinical teams.',
                image: heroConfig.image ?? 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=80',
                primaryCtaLabel: 'Find patient services',
                primaryCtaHref: '#services',
                secondaryCtaLabel: 'About FMCA',
                secondaryCtaHref: '#about',
            },
        ]
        : undefined);

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

                {/* 5: Campaign Hero Carousel */}
                <CampaignCarousel slides={slides} />

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