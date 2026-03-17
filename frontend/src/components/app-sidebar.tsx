import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Baby,
  Activity,
  Stethoscope,
  Map,
  Brain,
  FileBarChart2,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "city_health_officer",
      "physician",
      "phis_coordinator",
      "disease_surveillance_officer",
      "nurse",
      "bhw",
    ],
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["system_admin"],
  },
]

// Health program modules — coming in Phase 3+
const PROGRAM_MODULES = [
  { label: "Prenatal & Maternal", icon: Baby, phase: 3 },
  { label: "Epidemiology", icon: Activity, phase: 4 },
  { label: "TB / NCD", icon: Stethoscope, phase: 5 },
  { label: "GIS Mapping", icon: Map, phase: 7 },
  { label: "ML Forecasting", icon: Brain, phase: 8 },
  { label: "FHSIS Reports", icon: FileBarChart2, phase: 6 },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const location = useLocation()

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => user?.roles.includes(r))
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header — LINK brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none select-none">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HeartPulse className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight">LINK</span>
                <span className="truncate text-xs text-muted-foreground">CHO 2 Dasmariñas</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    isActive={location.pathname === item.href}
                    render={<NavLink to={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Health program modules — Phase 3+ */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Health Programs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PROGRAM_MODULES.map((mod) => (
                <SidebarMenuItem key={mod.label}>
                  <SidebarMenuButton
                    className="cursor-not-allowed opacity-45"
                    tooltip={`Phase ${mod.phase}`}
                    disabled
                  >
                    <mod.icon />
                    <span>{mod.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
