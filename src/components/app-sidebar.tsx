"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  ShoppingBag,
  Package,
  Tags,
  BarChart3,
  Users,
  ShoppingCart,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useLocale } from "next-intl";

function useNavigationData() {
  const t = useTranslations('Navigation');
  
  return {
    navMain: [
      {
        title: t('dashboard'),
        url: "/",
        icon: BarChart3,
        isActive: true,
      },
      {
        title: t('catalog'),
        url: "#",
        icon: Package,
        items: [
          {
            title: t('products'),
            url: "/products",
          },
          {
            title: t('categories'),
            url: "/categories",
          },
        ],
      },
      {
        title: t('orders'),
        url: "/orders",
        icon: ShoppingCart,
      },
      {
        title: t('customers'),
        url: "/customers",
        icon: Users,
      },
      {
        title: t('settings'),
        url: "#",
        icon: Settings2,
        items: [
          {
            title: t('general'),
            url: "/settings/general",
          },
          {
            title: t('store'),
            url: "/settings/store",
          },
          {
            title: t('users'),
            url: "/settings/users",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: t('support'),
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: t('feedback'),
        url: "#",
        icon: Send,
      },
    ],
    projects: [],
  };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const locale = useLocale();
  const { user } = useCurrentUser();
  const data = useNavigationData();
  const t = useTranslations('Navigation');
  
  // Set sidebar side based on locale (RTL for Arabic)
  const sidebarSide = locale === 'ar' ? 'right' : 'left';

  return (
    <Sidebar variant="inset" side={sidebarSide} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ShoppingBag className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{t('storeTitle')}</span>
                  <span className="truncate text-xs">{t('dashboardSubtitle')}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.name,
              email: user.email,
              image: user.image || undefined,
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
