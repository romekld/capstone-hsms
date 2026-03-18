import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser, updateUser } from "@/features/admin/api";
import {
  BhsAssignmentSection,
  CredentialsSection,
  RolesSection,
} from "@/features/admin/components/UserFormSections";

export function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Load state
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [healthStationId, setHealthStationId] = useState<number | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const isSystemAdmin = selectedRoles.includes("system_admin");

  const canSubmit = fullName.trim().length > 0 && selectedRoles.length > 0;

  useEffect(() => {
    if (!id) return;
    setIsFetching(true);
    setFetchError(false);
    getUser(Number(id))
      .then((user) => {
        setFullName(user.full_name);
        setEmail(user.email);
        setSelectedRoles(user.roles);
        setHealthStationId(user.health_station_id);
      })
      .catch(() => setFetchError(true))
      .finally(() => setIsFetching(false));
  }, [id]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setRoleError(null);

    try {
      await updateUser(Number(id), {
        full_name: fullName,
        roles: selectedRoles,
        health_station_id: isSystemAdmin ? null : healthStationId,
        ...(password ? { password } : {}),
      });
      toast.success("User updated successfully.");
      navigate("/admin/users");
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "";

      if (status === 422 && detail.includes("system_admin")) {
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
          <h1 className="text-2xl font-semibold text-foreground mt-4">Edit User</h1>
          {!isFetching && !fetchError && (
            <p className="text-sm text-muted-foreground mt-1">
              Update account details for {fullName}.
            </p>
          )}
        </header>

        {/* Fetch error state */}
        {fetchError && (
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-md text-sm text-destructive">
            Failed to load user. Go back and try again.
          </div>
        )}

        {/* Loading skeleton */}
        {isFetching && !fetchError && (
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-4 pt-8 border-t border-border">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-4 pt-8 border-t border-border">
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Form — only shown once data is loaded */}
        {!isFetching && !fetchError && (
          <div className="space-y-8 divide-y divide-border">
            {/* Identity section — inline (email is read-only, cannot reuse IdentitySection) */}
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Identity
              </h2>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-full-name">Full Name</FieldLabel>
                  <Input
                    id="edit-full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12"
                    placeholder="e.g. Maria Santos"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                  <Input
                    id="edit-email"
                    type="email"
                    value={email}
                    disabled
                    className="h-12 opacity-60 cursor-not-allowed"
                  />
                  <FieldDescription>Email cannot be changed after account creation.</FieldDescription>
                </Field>
              </FieldGroup>
            </section>

            {/* Credentials section */}
            <div className="pt-8">
              <CredentialsSection
                password={password}
                onPasswordChange={setPassword}
                showPassword={showPassword}
                onToggleShowPassword={() => setShowPassword((s) => !s)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Leave the password blank to keep the current password.
              </p>
            </div>

            {/* Roles section */}
            <div className="pt-8">
              <RolesSection
                selectedRoles={selectedRoles}
                onRolesChange={setSelectedRoles}
                roleError={roleError}
              />
            </div>

            {/* BHS Assignment section */}
            <div className="pt-8">
              <BhsAssignmentSection
                healthStationId={healthStationId}
                onHealthStationChange={setHealthStationId}
                hidden={isSystemAdmin}
              />
            </div>
          </div>
        )}

        {/* Sticky footer action bar */}
        {!isFetching && !fetchError && (
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
