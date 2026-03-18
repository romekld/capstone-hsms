import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
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

import { checkDuplicate, registerPatient } from "@/features/patients/api";
import type { PatientListItem } from "@/features/patients/types";
import { useHealthStations } from "@/features/health-stations/useHealthStations";
import { useAuth } from "@/hooks/useAuth";

// Extracted from backend/fixtures/cho2-boundaries.geojson (ADM4_PCODE → ADM4_EN)
// Must match exactly what migration 0002 seeds into the barangays table
const BARANGAY_OPTIONS = [
  { psgc_code: "PH0402106047", name: "Burol I" },
  { psgc_code: "PH0402106048", name: "Burol II" },
  { psgc_code: "PH0402106049", name: "Burol III" },
  { psgc_code: "PH0402106021", name: "Emmanuel Bergado I" },
  { psgc_code: "PH0402106050", name: "Emmanuel Bergado II" },
  { psgc_code: "PH0402106022", name: "Fatima I" },
  { psgc_code: "PH0402106051", name: "Fatima II" },
  { psgc_code: "PH0402106052", name: "Fatima III" },
  { psgc_code: "PH0402106023", name: "Luzviminda I" },
  { psgc_code: "PH0402106054", name: "Luzviminda II" },
  { psgc_code: "PH0402106025", name: "San Andres I" },
  { psgc_code: "PH0402106067", name: "San Andres II" },
  { psgc_code: "PH0402106026", name: "San Antonio de Padua I" },
  { psgc_code: "PH0402106068", name: "San Antonio de Padua II" },
  { psgc_code: "PH0402106029", name: "San Francisco I" },
  { psgc_code: "PH0402106069", name: "San Francisco II" },
  { psgc_code: "PH0402106032", name: "San Lorenzo Ruiz I" },
  { psgc_code: "PH0402106071", name: "San Lorenzo Ruiz II" },
  { psgc_code: "PH0402106033", name: "San Luis I" },
  { psgc_code: "PH0402106072", name: "San Luis II" },
  { psgc_code: "PH0402106035", name: "San Mateo" },
  { psgc_code: "PH0402106037", name: "San Nicolas I" },
  { psgc_code: "PH0402106075", name: "San Nicolas II" },
  { psgc_code: "PH0402106038", name: "San Roque (Sta. Cristina II)" },
  { psgc_code: "PH0402106039", name: "San Simon (Barangay 7)" },
  { psgc_code: "PH0402106040", name: "Santa Cristina I" },
  { psgc_code: "PH0402106076", name: "Santa Cristina II" },
  { psgc_code: "PH0402106041", name: "Santa Cruz I" },
  { psgc_code: "PH0402106077", name: "Santa Cruz II" },
  { psgc_code: "PH0402106042", name: "Santa Fe" },
  { psgc_code: "PH0402106044", name: "Santa Maria (Barangay 20)" },
  { psgc_code: "PH0402106081", name: "Victoria Reyes" },
] as const;

interface FormErrors {
  last_name?: string;
  first_name?: string;
  birthdate?: string;
  sex?: string;
  barangay_psgc_code?: string;
  health_station_id?: string;
}

function formatRegistrationDate(isoDatetime: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(isoDatetime));
}

export function RegisterPatientPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stations, loading: stationsLoading, error: stationsError } = useHealthStations();

  // Form fields
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [barangayPsgcCode, setBarangayPsgcCode] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [healthStationId, setHealthStationId] = useState<string>(
    user?.health_station_id != null ? String(user.health_station_id) : ""
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [duplicatePatient, setDuplicatePatient] = useState<PatientListItem | null>(null);

  // Client-side validation
  const validate = (): FormErrors => {
    const errors: FormErrors = {};
    if (!lastName.trim()) errors.last_name = "Last name is required.";
    if (!firstName.trim()) errors.first_name = "First name is required.";
    if (!birthdate) errors.birthdate = "Birthdate is required.";
    if (!sex) errors.sex = "Sex is required.";
    if (!barangayPsgcCode) errors.barangay_psgc_code = "Barangay is required.";
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const newPatient = await registerPatient({
        last_name: lastName.trim(),
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        birthdate,
        sex: sex as "male" | "female",
        barangay_psgc_code: barangayPsgcCode,
        address_line: addressLine.trim() || null,
        mobile_number: mobileNumber.trim() || null,
        force_duplicate: false,
      });
      toast.success("Patient registered successfully.");
      navigate(`/patients/${newPatient.id}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;

      if (status === 409) {
        // Duplicate detected — fetch existing patient details to populate warning card
        try {
          const dupResult = await checkDuplicate(lastName.trim(), firstName.trim(), birthdate);
          if (dupResult.has_duplicate && dupResult.existing_patient) {
            setDuplicatePatient(dupResult.existing_patient);
          } else {
            // Backend said 409 but checkDuplicate returned no match — show generic warning
            setDuplicatePatient(null);
            toast.error("A patient with similar details already exists.");
          }
        } catch {
          toast.error("Could not save patient record. Check your connection and try again.");
        }
      } else {
        toast.error("Could not save patient record. Check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // "Register Anyway" — re-submits with force_duplicate: true to bypass duplicate guard
  const handleRegisterAnyway = async () => {
    setIsSubmitting(true);
    try {
      const newPatient = await registerPatient({
        last_name: lastName.trim(),
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        birthdate,
        sex: sex as "male" | "female",
        barangay_psgc_code: barangayPsgcCode,
        address_line: addressLine.trim() || null,
        mobile_number: mobileNumber.trim() || null,
        force_duplicate: true,
      });
      toast.success("Patient registered successfully.");
      navigate(`/patients/${newPatient.id}`);
    } catch {
      toast.error("Could not save patient record. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissDuplicate = () => {
    setDuplicatePatient(null);
  };

  const selectedBhsName =
    stations.find((s) => String(s.id) === healthStationId)?.name ?? "";

  return (
    <div className="min-h-screen bg-background login-page-enter">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/patients" />}>
                Patients
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Register Patient</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page header */}
        <header>
          <h1 className="text-[1.75rem] font-semibold leading-[1.2] text-foreground">
            Register Patient
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete all required fields to create a new patient record.
          </p>
        </header>

        {/* Form */}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="space-y-8"
        >
          {/* Section 1 — Identity */}
          <FieldSet>
            <FieldLegend>Identity</FieldLegend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Last Name */}
              <Field data-invalid={!!formErrors.last_name || undefined}>
                <FieldLabel htmlFor="last-name">
                  Last Name <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.last_name}
                  aria-describedby={formErrors.last_name ? "last-name-error" : undefined}
                  disabled={isSubmitting}
                />
                {formErrors.last_name && (
                  <FieldError id="last-name-error">{formErrors.last_name}</FieldError>
                )}
              </Field>

              {/* First Name */}
              <Field data-invalid={!!formErrors.first_name || undefined}>
                <FieldLabel htmlFor="first-name">
                  First Name <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.first_name}
                  aria-describedby={formErrors.first_name ? "first-name-error" : undefined}
                  autoFocus
                  disabled={isSubmitting}
                />
                {formErrors.first_name && (
                  <FieldError id="first-name-error">{formErrors.first_name}</FieldError>
                )}
              </Field>

              {/* Middle Name */}
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="middle-name">Middle Name</FieldLabel>
                <Input
                  id="middle-name"
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>
            </div>
          </FieldSet>

          {/* Section 2 — Demographics */}
          <FieldSet>
            <FieldLegend>Demographics</FieldLegend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Birthdate */}
              <Field data-invalid={!!formErrors.birthdate || undefined}>
                <FieldLabel htmlFor="birthdate">
                  Birthdate <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.birthdate}
                  aria-describedby={formErrors.birthdate ? "birthdate-error" : undefined}
                  disabled={isSubmitting}
                />
                {formErrors.birthdate && (
                  <FieldError id="birthdate-error">{formErrors.birthdate}</FieldError>
                )}
              </Field>

              {/* Sex */}
              <Field data-invalid={!!formErrors.sex || undefined}>
                <FieldLabel htmlFor="sex">
                  Sex <span aria-hidden="true">*</span>
                </FieldLabel>
                <Select
                  value={sex}
                  onValueChange={(val) => setSex(val as "male" | "female")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="sex"
                    className="w-full"
                    aria-required="true"
                    aria-invalid={!!formErrors.sex}
                    aria-describedby={formErrors.sex ? "sex-error" : undefined}
                  >
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.sex && (
                  <FieldError id="sex-error">{formErrors.sex}</FieldError>
                )}
              </Field>
            </div>
          </FieldSet>

          {/* Section 3 — Address */}
          <FieldSet>
            <FieldLegend>Address</FieldLegend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Barangay */}
              <Field data-invalid={!!formErrors.barangay_psgc_code || undefined}>
                <FieldLabel htmlFor="barangay">
                  Barangay <span aria-hidden="true">*</span>
                </FieldLabel>
                <Select
                  value={barangayPsgcCode}
                  onValueChange={(val) => setBarangayPsgcCode(val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="barangay"
                    className="w-full"
                    aria-required="true"
                    aria-invalid={!!formErrors.barangay_psgc_code}
                    aria-describedby={formErrors.barangay_psgc_code ? "barangay-error" : undefined}
                  >
                    <SelectValue placeholder="Select barangay" />
                  </SelectTrigger>
                  <SelectContent>
                    {BARANGAY_OPTIONS.map((b) => (
                      <SelectItem key={b.psgc_code} value={b.psgc_code}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.barangay_psgc_code && (
                  <FieldError id="barangay-error">{formErrors.barangay_psgc_code}</FieldError>
                )}
              </Field>

              {/* Address Line */}
              <Field>
                <FieldLabel htmlFor="address-line">Address Line</FieldLabel>
                <Input
                  id="address-line"
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="House/Lot/Street"
                  disabled={isSubmitting}
                />
              </Field>
            </div>
          </FieldSet>

          {/* Section 4 — Contact */}
          <FieldSet>
            <FieldLegend>Contact</FieldLegend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Field>
                <FieldLabel htmlFor="mobile-number">Mobile Number</FieldLabel>
                <Input
                  id="mobile-number"
                  type="tel"
                  inputMode="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 09171234567"
                  disabled={isSubmitting}
                />
              </Field>
            </div>
          </FieldSet>

          {/* Section 5 — Assignment */}
          <FieldSet>
            <FieldLegend>Assignment</FieldLegend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Field>
                <FieldLabel htmlFor="health-station">
                  Health Station <span aria-hidden="true">*</span>
                </FieldLabel>
                {/* Pre-filled from user.health_station_id; displayed read-only for non-admin
                    since the backend auto-assigns from current_user.health_station_id */}
                <Select
                  value={healthStationId}
                  onValueChange={(val) => setHealthStationId(val)}
                  disabled={isSubmitting || stationsLoading || !!stationsError}
                >
                  <SelectTrigger
                    id="health-station"
                    className="w-full"
                    aria-required="true"
                  >
                    <SelectValue
                      placeholder={stationsLoading ? "Loading stations…" : "Select health station"}
                    >
                      {selectedBhsName || undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {stationsError && (
                  <p className="text-sm text-destructive mt-1">{stationsError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Pre-filled from your account. The backend assigns this automatically.
                </p>
              </Field>
            </div>
          </FieldSet>

          {/* Duplicate warning — shown inline above submit area */}
          {duplicatePatient && (
            <Alert
              variant="destructive"
              className="animate-in fade-in slide-in-from-top-2 duration-200 border-[color:var(--status-critical)]/40 bg-[color:var(--status-critical)]/5"
            >
              <AlertTitle className="font-semibold text-[color:var(--status-critical)]">
                Patient may already exist
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm text-foreground/80">
                {duplicatePatient.full_name}, registered at{" "}
                {duplicatePatient.health_station_name} on{" "}
                {formatRegistrationDate(duplicatePatient.created_at)}. Review the existing
                record before creating a new one.
              </AlertDescription>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/patients/${duplicatePatient.id}`)}
                >
                  Use Existing Patient
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[color:var(--status-critical)] hover:bg-[color:var(--status-critical)]/10"
                  onClick={() => void handleRegisterAnyway()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </span>
                  ) : (
                    "Register Anyway"
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                This will be flagged for review by the administrator.
              </p>
            </Alert>
          )}

          {/* Submit area */}
          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground mb-4">* Required</p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/patients")}
                disabled={isSubmitting}
                className="sm:w-auto w-full"
              >
                Back to Patients
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="sm:w-auto w-full"
                onClick={() => {
                  // Dismiss stale duplicate warning when user re-submits
                  dismissDuplicate();
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  "Register Patient"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
