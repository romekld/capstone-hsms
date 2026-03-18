import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createUser } from "@/features/admin/api";
import {
  BhsAssignmentSection,
  CredentialsSection,
  IdentitySection,
  RolesSection,
} from "@/features/admin/components/UserFormSections";

export function CreateUserPage() {
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [healthStationId, setHealthStationId] = useState<number | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const isSystemAdmin = selectedRoles.includes("system_admin");

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    selectedRoles.length > 0;

  const handleSubmit = async () => {
    setIsLoading(true);
    setEmailError(null);
    setRoleError(null);

    try {
      await createUser({
        email,
        full_name: fullName,
        password,
        roles: selectedRoles,
        health_station_id: isSystemAdmin ? null : healthStationId,
      });
      toast.success("User created successfully.");
      navigate("/admin/users");
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "";

      if (status === 409) {
        setEmailError("This email is already in use.");
      } else if (status === 422 && detail.includes("system_admin")) {
        setRoleError("system_admin cannot be combined with other roles.");
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Page header */}
        <header>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/users")}
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" data-icon="inline-start" />
            Back to Users
          </Button>
          <h1 className="text-2xl font-semibold text-foreground mt-4">Create User</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Provision a new staff account for the health information system.
          </p>
        </header>

        {/* Form sections — vertically stacked with dividers */}
        <div className="space-y-8 divide-y divide-border">
          <IdentitySection
            fullName={fullName}
            onFullNameChange={setFullName}
            email={email}
            onEmailChange={setEmail}
            emailError={emailError}
          />
          <div className="pt-8">
            <CredentialsSection
              password={password}
              onPasswordChange={setPassword}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((s) => !s)}
            />
          </div>
          <div className="pt-8">
            <RolesSection
              selectedRoles={selectedRoles}
              onRolesChange={setSelectedRoles}
              roleError={roleError}
            />
          </div>
          <div className="pt-8">
            <BhsAssignmentSection
              healthStationId={healthStationId}
              onHealthStationChange={setHealthStationId}
              hidden={isSystemAdmin}
            />
          </div>
        </div>

        {/* Sticky footer action bar */}
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 pb-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/users")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isLoading || !canSubmit}
            className="bg-primary hover:bg-primary/90 min-w-[120px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </span>
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
