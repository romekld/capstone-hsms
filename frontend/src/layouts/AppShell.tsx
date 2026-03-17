import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[]; // empty array = all authenticated roles
}

const NAV_ITEMS: NavItem[] = [
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
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["system_admin"],
  },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      item.roles.length === 0 ||
      item.roles.some((r) => user?.roles.includes(r))
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="px-4 py-3 border-b border-border">
            <span className="text-base font-semibold text-foreground">
              LINK
            </span>
            <span className="text-xs text-muted-foreground block">
              CHO 2 Dasmariñas
            </span>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                              isActive ? "text-primary font-medium" : ""
                            }
                          />
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-3 py-3 border-t border-border">
            {user && (
              <div className="mb-2 px-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {user.email || "Signed in"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.roles[0]?.replace(/_/g, " ")}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleLogout()}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-12 items-center gap-2 border-b border-border px-4 md:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
