import { useNavigate } from "react-router-dom"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, BadgeCheckIcon, BellIcon, LogOutIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

const ROLE_LABELS: Record<string, string> = {
  system_admin: "System Administrator",
  city_health_officer: "City Health Officer",
  physician: "Physician",
  phis_coordinator: "PHIS Coordinator",
  disease_surveillance_officer: "Disease Surveillance Officer",
  nurse: "Nurse / Midwife",
  bhw: "Barangay Health Worker",
}

function getInitials(email: string): string {
  const parts = email.split("@")[0].split(/[._-]/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

export function NavUser() {
  const { user, logout } = useAuth()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  if (!user) return null

  const initials = getInitials(user.email)
  const roleLabel = ROLE_LABELS[user.roles[0]] ?? user.roles[0]?.replace(/_/g, " ")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(sidebarMenuButtonVariants({ size: "lg" }), "aria-expanded:bg-sidebar-accent")}
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.email}</span>
              <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.email}</span>
                  <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <BadgeCheckIcon />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void handleLogout()}>
              <LogOutIcon />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
