import { Link } from '@inertiajs/react';
import { ArrowLeftRight, BookOpen, Building2, FolderGit2, LayoutGrid, LayoutTemplate, Megaphone, Newspaper, ScrollText, Stethoscope } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
        title: 'Pages',
        href: cms.pages.index(),
        icon: LayoutTemplate,
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

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
