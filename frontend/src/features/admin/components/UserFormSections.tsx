import { Eye, EyeOff } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { HEALTH_STATIONS } from "@/features/admin/healthStations";
import { ROLE_OPTIONS } from "@/features/admin/types";

// --- IdentitySection ---
interface IdentitySectionProps {
  fullName: string;
  onFullNameChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  emailError: string | null;
}

export function IdentitySection({
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  emailError,
}: IdentitySectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Identity</h2>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="identity-full-name">Full Name</FieldLabel>
          <Input
            id="identity-full-name"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            required
            className="h-12"
            placeholder="e.g. Maria Santos"
          />
        </Field>
        <Field data-invalid={emailError ? true : undefined}>
          <FieldLabel htmlFor="identity-email">Email</FieldLabel>
          <Input
            id="identity-email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            className="h-12"
            placeholder="e.g. m.santos@cho2.gov.ph"
            aria-invalid={emailError ? true : undefined}
          />
          {emailError && <FieldError>{emailError}</FieldError>}
        </Field>
      </FieldGroup>
    </section>
  );
}

// --- CredentialsSection ---
interface CredentialsSectionProps {
  password: string;
  onPasswordChange: (v: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}

export function CredentialsSection({
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
}: CredentialsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Credentials
      </h2>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="credentials-password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="credentials-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              className="h-12 pr-12"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" data-icon />
              ) : (
                <Eye className="h-5 w-5" data-icon />
              )}
            </button>
          </div>
        </Field>
      </FieldGroup>
    </section>
  );
}

// --- RolesSection ---
interface RolesSectionProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  roleError: string | null;
}

export function RolesSection({ selectedRoles, onRolesChange, roleError }: RolesSectionProps) {
  const isSystemAdmin = selectedRoles.includes("system_admin");

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      if (role === "system_admin") {
        onRolesChange(["system_admin"]);
      } else {
        onRolesChange(selectedRoles.filter((r) => r !== "system_admin").concat(role));
      }
    } else {
      onRolesChange(selectedRoles.filter((r) => r !== role));
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Role Assignment
      </h2>
      <FieldSet>
        <FieldLegend variant="label" className="sr-only">
          Roles
        </FieldLegend>
        {roleError && <FieldError className="mb-2">{roleError}</FieldError>}
        <FieldGroup className="gap-1">
          {ROLE_OPTIONS.map(({ value, label }) => {
            const isDisabled = isSystemAdmin && value !== "system_admin";
            return (
              <Field key={value} orientation="horizontal" className="min-h-[48px] items-center">
                <Checkbox
                  id={`role-new-${value}`}
                  checked={selectedRoles.includes(value)}
                  onCheckedChange={(checked) => handleRoleChange(value, !!checked)}
                  disabled={isDisabled}
                  className={isDisabled ? "opacity-50" : ""}
                />
                <FieldLabel
                  htmlFor={`role-new-${value}`}
                  className={`text-sm font-normal cursor-pointer ${isDisabled ? "opacity-50" : ""}`}
                >
                  {label}
                </FieldLabel>
              </Field>
            );
          })}
        </FieldGroup>
      </FieldSet>
    </section>
  );
}

// --- BhsAssignmentSection ---
interface BhsAssignmentSectionProps {
  healthStationId: number | null;
  onHealthStationChange: (id: number | null) => void;
  hidden: boolean;
}

export function BhsAssignmentSection({
  healthStationId,
  onHealthStationChange,
  hidden,
}: BhsAssignmentSectionProps) {
  if (hidden) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        BHS Assignment
      </h2>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="bhs-assignment">Health Station</FieldLabel>
          <Select
            value={healthStationId != null ? String(healthStationId) : ""}
            onValueChange={(v) => onHealthStationChange(v ? Number(v) : null)}
          >
            <SelectTrigger id="bhs-assignment" className="h-12 w-full">
              <SelectValue placeholder="— No BHS assignment —" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">— No BHS assignment —</SelectItem>
              {HEALTH_STATIONS.map((hs) => (
                <SelectItem key={hs.id} value={String(hs.id)}>
                  {hs.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Required for Nurse, Midwife, Physician, and BHW roles.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </section>
  );
}
