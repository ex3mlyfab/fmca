import { Link } from '@inertiajs/react';
import { ArrowLeftRight, Building2, FileText, Handshake, Hospital, Image as ImageIcon, Landmark, LayoutGrid, LayoutTemplate, MapPin, Megaphone, Navigation, Newspaper, Palette, ScrollText, Stethoscope, UserRound } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import cms from '@/routes/cms';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Departments',
        href: cms.departments.index(),
        icon: Building2,
    },
    {
        title: 'Services',
        href: cms.services.index(),
        icon: Stethoscope,
    },
    {
        title: 'Clinics',
        href: cms.clinics.index(),
        icon: Hospital,
    },
    {
        title: 'Consultants',
        href: cms.consultants.index(),
        icon: UserRound,
    },
    {
        title: 'Committees',
        href: cms.committees.index(),
        icon: Landmark,
    },
    {
        title: 'Partners',
        href: cms.partners.index(),
        icon: Handshake,
    },
    {
        title: 'News',
        href: cms.news.index(),
        icon: Newspaper,
    },
    {
        title: 'Campaigns',
        href: cms.campaigns.index(),
        icon: Megaphone,
    },
    {
        title: 'Media',
        href: cms.media.index(),
        icon: ImageIcon,
    },
    {
        title: 'Documents',
        href: cms.documents.index(),
        icon: FileText,
    },
    {
        title: 'Pages',
        href: cms.pages.index(),
        icon: LayoutTemplate,
    },
    {
        title: 'Site Menu',
        href: cms.siteMenu.index(),
        icon: Navigation,
    },
    {
        title: 'Brand Identity',
        href: cms.brandIdentity.index(),
        icon: Palette,
    },
    {
        title: 'About & Contact',
        href: cms.instituteProfile.index(),
        icon: MapPin,
    },
    {
        title: 'URL Redirects',
        href: cms.redirects.index(),
        icon: ArrowLeftRight,
    },
    {
        title: 'Audit Log',
        href: cms.audit.index(),
        icon: ScrollText,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
