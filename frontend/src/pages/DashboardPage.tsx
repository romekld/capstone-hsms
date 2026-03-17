import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Baby,
  Activity,
  Stethoscope,
  Map,
  Brain,
  FileBarChart2,
  Building2,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  system_admin: "System Administrator",
  city_health_officer: "City Health Officer",
  physician: "Physician",
  phis_coordinator: "PHIS Coordinator",
  disease_surveillance_officer: "Disease Surveillance Officer",
  nurse: "Nurse / Midwife",
  bhw: "Barangay Health Worker",
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// TODO: Replace with real API data in Phase 3+
const PLACEHOLDER_STATS = [
  {
    label: "BHS Stations",
    value: "32",
    sub: "Dasmariñas City",
    icon: Building2,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Residents Covered",
    value: "164,691",
    sub: "Total population",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Active Alerts",
    value: "—",
    sub: "Phase 4 · Epi module",
    icon: AlertTriangle,
    color: "text-muted-foreground",
    bg: "bg-muted",
    disabled: true,
  },
  {
    label: "Pending Sync",
    value: "—",
    sub: "Phase 3 · BHW offline",
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted",
    disabled: true,
  },
]

const PROGRAM_MODULES = [
  {
    label: "Prenatal & Maternal Care",
    description: "Antenatal records, delivery tracking, postpartum follow-up.",
    icon: Baby,
    phase: 3,
  },
  {
    label: "Epidemiology (PIDSR)",
    description: "Notifiable disease surveillance, Category I/II reporting.",
    icon: Activity,
    phase: 4,
  },
  {
    label: "TB / NCD Management",
    description: "TB DOTS, hypertension, diabetes — PhilPEN protocol.",
    icon: Stethoscope,
    phase: 5,
  },
  {
    label: "FHSIS Reports",
    description: "Auto-generated M1, M2, Q1, A1 DOH indicators.",
    icon: FileBarChart2,
    phase: 6,
  },
  {
    label: "GIS Mapping",
    description: "Choropleth density maps, cluster hotspot detection.",
    icon: Map,
    phase: 7,
  },
  {
    label: "ML Forecasting",
    description: "Prophet disease trends, WHO z-score nutrition classification.",
    icon: Brain,
    phase: 8,
  },
]

export function DashboardPage() {
  const { user } = useAuth()

  const primaryRole = user?.roles[0]
  const roleLabel = primaryRole ? (ROLE_LABELS[primaryRole] ?? primaryRole.replace(/_/g, " ")) : ""
  const greeting = getGreeting()

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You are signed in as{" "}
          <span className="font-medium text-foreground">{roleLabel}</span>
          {user?.health_station_id && (
            <> · BHS Station #{user.health_station_id}</>
          )}
        </p>
      </div>

      {/* Stat cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PLACEHOLDER_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className={`size-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-semibold ${stat.disabled ? "text-muted-foreground" : "text-foreground"}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
              <p className="text-[11px] text-muted-foreground/70 truncate">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Health program modules */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Health Program Modules</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Clinical modules are being built in Phase 3 onwards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROGRAM_MODULES.map((mod) => (
            <div
              key={mod.label}
              className="group rounded-xl border border-border bg-card p-5 space-y-3 opacity-70"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <mod.icon className="size-4 text-muted-foreground" />
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  Phase {mod.phase}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{mod.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
