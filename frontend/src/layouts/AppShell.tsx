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
  "/admin/users": "User Management",
  "/unauthorized": "Access Restricted",
}

export function AppShell() {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] ?? "LINK"

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
