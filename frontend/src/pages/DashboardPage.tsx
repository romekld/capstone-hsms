import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

// Role display labels — maps role string to human-readable label
const ROLE_LABELS: Record<string, string> = {
  system_admin: "System Administrator",
  city_health_officer: "City Health Officer",
  physician: "Physician",
  phis_coordinator: "PHIS Coordinator",
  disease_surveillance_officer: "Disease Surveillance Officer",
  nurse: "Nurse / Midwife",
  bhw: "Barangay Health Worker",
};

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-foreground">
            Project LINK Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            CHO 2 Dasmariñas City Health Station Management
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="shrink-0"
        >
          Sign Out
        </Button>
      </div>

      {/* Identity confirmation — UI-SPEC: "Role label in page heading confirming identity" */}
      {user && (
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-3">Signed in as</p>
          <p className="text-base font-semibold text-foreground mb-3">
            {user.email}
          </p>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {ROLE_LABELS[role] ?? role}
              </Badge>
            ))}
          </div>
          {user.health_station_id && (
            <p className="mt-3 text-xs text-muted-foreground font-mono">
              BHS Station ID: {user.health_station_id}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 p-6 border border-dashed border-border rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Clinical modules coming in Phase 3+. This is the dashboard placeholder.
        </p>
      </div>
    </div>
  );
}
