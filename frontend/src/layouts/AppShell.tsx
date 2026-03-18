import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Human-readable page titles by pathname
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/patients": "Patients",
  "/patients/new": "Register Patient",
  "/admin/users": "User Management",
  "/admin/users/new": "Create User",
  "/unauthorized": "Access Restricted",
}

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Dynamic patient profile routes
  if (pathname.startsWith("/patients")) return "Patients";
  // Dynamic admin routes
  if (pathname.startsWith("/admin/users")) return "User Management";
  return "LINK";
}

export function AppShell() {
  const location = useLocation()
  const pageTitle = resolvePageTitle(location.pathname)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Sticky page header */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-foreground">{pageTitle}</span>
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
