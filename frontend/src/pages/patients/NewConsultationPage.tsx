import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Droplets,
  Heart,
  Loader2,
  Scale,
  SendToBack,
  Stethoscope,
  Thermometer,
  Wind,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";

import { createConsultation, getPatient } from "@/features/patients/api";
import type { PatientResponse } from "@/features/patients/types";
import { useAuth } from "@/hooks/useAuth";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONSULTATION_WRITE_ROLES = ["nurse", "midwife", "physician"] as const;

// Client-side range constraints matching backend Pydantic validators
const RANGES = {
  bp_systolic:      { min: 40,   max: 300,  step: 1,   label: "Systolic BP",       unit: "mmHg" },
  bp_diastolic:     { min: 20,   max: 200,  step: 1,   label: "Diastolic BP",      unit: "mmHg" },
  heart_rate:       { min: 20,   max: 300,  step: 1,   label: "Heart Rate",        unit: "bpm"  },
  respiratory_rate: { min: 4,    max: 80,   step: 1,   label: "Respiratory Rate",  unit: "breaths/min" },
  temperature:      { min: 30.0, max: 45.0, step: 0.1, label: "Temperature",       unit: "°C"   },
  weight:           { min: 0.5,  max: 500,  step: 0.1, label: "Weight",            unit: "kg"   },
  height:           { min: 20,   max: 300,  step: 0.1, label: "Height",            unit: "cm"   },
} as const;

type VitalKey = keyof typeof RANGES;

// ---------------------------------------------------------------------------
// BMI helper
// ---------------------------------------------------------------------------

function computeBmi(weight: string, height: string): string {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h || h <= 0) return "--";
  return (w / Math.pow(h / 100, 2)).toFixed(1);
}

// ---------------------------------------------------------------------------
// Inline range validation helper
// ---------------------------------------------------------------------------

function validateRange(key: VitalKey, value: string): string {
  if (value === "") return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "Must be a number.";
  const { min, max, label } = RANGES[key];
  if (num < min || num > max) return `${label} must be between ${min} and ${max}.`;
  return "";
}

// ---------------------------------------------------------------------------
// Vital range status for real-time badge
// ---------------------------------------------------------------------------

type VitalStatus = "normal" | "high" | "low" | "critical";

function vitalStatus(key: VitalKey, value: string): VitalStatus | null {
  if (value === "") return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  // Display-only normal ranges (different from hard validation ranges)
  const normal: Record<VitalKey, [number, number]> = {
    bp_systolic:      [90, 130],
    bp_diastolic:     [60, 85],
    heart_rate:       [60, 100],
    respiratory_rate: [12, 20],
    temperature:      [36.1, 37.2],
    weight:           [0.5, 500],
    height:           [20, 300],
  };
  if (key === "weight" || key === "height") return "normal";
  const [lo, hi] = normal[key];
  if (num < lo) return num < lo * 0.85 ? "critical" : "low";
  if (num > hi) return num > hi * 1.15 ? "critical" : "high";
  return "normal";
}

function VitalStatusBadge({ status }: { status: VitalStatus | null }) {
  if (!status) return null;
  const config: Record<VitalStatus, { label: string; className: string }> = {
    normal:   { label: "Normal",   className: "text-[color:var(--status-safe)]   bg-[color:var(--status-safe)]/10   border-[color:var(--status-safe)]/30" },
    high:     { label: "High",     className: "text-[color:var(--status-warning)] bg-[color:var(--status-warning)]/10 border-[color:var(--status-warning)]/30" },
    low:      { label: "Low",      className: "text-[color:var(--status-warning)] bg-[color:var(--status-warning)]/10 border-[color:var(--status-warning)]/30" },
    critical: { label: "Critical", className: "text-[color:var(--status-critical)] bg-[color:var(--status-critical)]/10 border-[color:var(--status-critical)]/30" },
  };
  const { label, className } = config[status];
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold px-1.5 py-0 h-5 shrink-0 ${className}`}
    >
      {label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  required?: boolean;
  children: React.ReactNode;
}

function SectionCard({ icon, title, required, children }: SectionCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
        <span className="size-4 text-muted-foreground shrink-0">{icon}</span>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex-1">
          {title}
        </h2>
        {required && (
          <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30 bg-destructive/5 px-1.5 py-0 h-5">
            Required
          </Badge>
        )}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Vital input row
// ---------------------------------------------------------------------------

interface VitalRowProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  value: string;
  error: string;
  vitalKey: VitalKey;
  placeholder?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function VitalRow({
  icon, label, id, value, error, vitalKey, placeholder, disabled, onChange,
}: VitalRowProps) {
  const { min, max, step, unit } = RANGES[vitalKey];
  const status = vitalStatus(vitalKey, value);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="size-3.5 text-muted-foreground shrink-0">{icon}</span>
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        <VitalStatusBadge status={status} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-h-[48px] text-base rounded-lg border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 w-full"
        />
        <span className="text-xs text-muted-foreground shrink-0">{unit}</span>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress indicator — how many sections have data
// ---------------------------------------------------------------------------

function sectionsFilled(
  chiefComplaint: string,
  hasAnyVital: boolean,
  diagnosis: string,
  referringTo: string
): number {
  return [chiefComplaint.trim(), hasAnyVital, diagnosis.trim(), referringTo.trim()].filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NewConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientId = Number(id);

  // ---- Patient header data ------------------------------------------------
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);

  // ---- Form state ----------------------------------------------------------
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [chiefComplaintError, setChiefComplaintError] = useState("");

  // Core vitals + errors
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpSystolicError, setBpSystolicError] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [bpDiastolicError, setBpDiastolicError] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [heartRateError, setHeartRateError] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [respiratoryRateError, setRespiratoryRateError] = useState("");
  const [temperature, setTemperature] = useState("");
  const [temperatureError, setTemperatureError] = useState("");
  const [weight, setWeight] = useState("");
  const [weightError, setWeightError] = useState("");
  const [height, setHeight] = useState("");
  const [heightError, setHeightError] = useState("");

  // Additional vitals
  const [o2Saturation, setO2Saturation] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");

  // Assessment & referral
  const [diagnosis, setDiagnosis] = useState("");
  const [referringTo, setReferringTo] = useState("");

  // Async state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- RBAC guard ---------------------------------------------------------
  const isWriteRole =
    user?.roles.some((r) =>
      CONSULTATION_WRITE_ROLES.includes(r as (typeof CONSULTATION_WRITE_ROLES)[number])
    ) ?? false;

  useEffect(() => {
    if (user && !isWriteRole) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, isWriteRole, navigate]);

  // ---- Fetch patient for header display -----------------------------------
  useEffect(() => {
    if (!patientId || isNaN(patientId)) return;
    let cancelled = false;
    const run = async () => {
      try {
        const data = await getPatient(patientId);
        if (!cancelled) setPatient(data);
      } catch {
        // Non-fatal — header degrades gracefully
      } finally {
        if (!cancelled) setPatientLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [patientId]);

  // ---- Live BMI -----------------------------------------------------------
  const bmi = computeBmi(weight, height);

  // ---- Range change handlers ----------------------------------------------
  function handleVitalChange(
    value: string,
    setter: (v: string) => void,
    errorSetter: (e: string) => void,
    key: VitalKey
  ) {
    setter(value);
    errorSetter(validateRange(key, value));
  }

  // ---- Full name ----------------------------------------------------------
  const fullName = patient
    ? `${patient.last_name}, ${patient.first_name}${patient.middle_name ? ` ${patient.middle_name}` : ""}`
    : "";

  // ---- Progress indicator -------------------------------------------------
  const hasAnyVital = [bpSystolic, bpDiastolic, heartRate, respiratoryRate, temperature, weight, height].some(v => v !== "");
  const filled = sectionsFilled(chiefComplaint, hasAnyVital, diagnosis, referringTo);
  const totalSections = 4; // complaint, vitals, assessment, referral

  // ---- Submit -------------------------------------------------------------
  const handleSubmit = async () => {
    let hasError = false;

    if (!chiefComplaint.trim()) {
      setChiefComplaintError("Chief complaint is required.");
      hasError = true;
    }

    // Validate all vitals
    const vitalsToCheck: [VitalKey, string, (e: string) => void][] = [
      ["bp_systolic",      bpSystolic,      setBpSystolicError],
      ["bp_diastolic",     bpDiastolic,     setBpDiastolicError],
      ["heart_rate",       heartRate,       setHeartRateError],
      ["respiratory_rate", respiratoryRate, setRespiratoryRateError],
      ["temperature",      temperature,     setTemperatureError],
      ["weight",           weight,          setWeightError],
      ["height",           height,          setHeightError],
    ];

    for (const [key, value, errorSetter] of vitalsToCheck) {
      const err = validateRange(key, value);
      if (err) {
        errorSetter(err);
        hasError = true;
      }
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      const vitalsExtra: Record<string, unknown> = {};
      if (o2Saturation !== "") vitalsExtra.o2_saturation = parseFloat(o2Saturation);
      if (bloodGlucose !== "") vitalsExtra.blood_glucose = parseFloat(bloodGlucose);

      await createConsultation(patientId, {
        chief_complaint: chiefComplaint.trim(),
        bp_systolic:       bpSystolic       !== "" ? parseInt(bpSystolic, 10)       : null,
        bp_diastolic:      bpDiastolic      !== "" ? parseInt(bpDiastolic, 10)      : null,
        heart_rate:        heartRate        !== "" ? parseInt(heartRate, 10)        : null,
        respiratory_rate:  respiratoryRate  !== "" ? parseInt(respiratoryRate, 10)  : null,
        temperature:       temperature      !== "" ? parseFloat(temperature)        : null,
        weight:            weight           !== "" ? parseFloat(weight)             : null,
        height:            height           !== "" ? parseFloat(height)             : null,
        vitals_extra: Object.keys(vitalsExtra).length > 0 ? vitalsExtra : null,
        diagnosis: diagnosis.trim() || null,
        referring_to: referringTo.trim() || null,
      });

      toast.success("Consultation saved.");
      navigate(`/patients/${patientId}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number; data?: { detail?: unknown } } };
      if (axiosErr.response?.status === 422) {
        const detail = axiosErr.response.data?.detail;
        if (Array.isArray(detail)) {
          const msg = detail
            .map((e: { loc: string[]; msg: string }) => `${e.loc.slice(1).join(".")}: ${e.msg}`)
            .join("; ");
          toast.error(`Validation error: ${msg}`);
        } else {
          toast.error("Invalid data. Check all fields and try again.");
        }
      } else {
        toast.error("Could not save consultation. Check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="min-h-screen bg-background">

      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/patients" />}>Patients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {patientLoading ? (
                <BreadcrumbPage>Loading...</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link to={`/patients/${patientId}`} />}>
                  {fullName || `Patient #${patientId}`}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Consultation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Sticky action header                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          {/* Left: patient identity + progress indicator */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">
              New Consultation
            </h1>
            {patientLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : patient ? (
              <>
                <span className="text-muted-foreground text-sm">—</span>
                <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {fullName}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs bg-[color:var(--bhs-tier,hsl(var(--primary)))]/10 text-[color:var(--bhs-tier,hsl(var(--primary)))] border-[color:var(--bhs-tier,hsl(var(--primary)))]/30 shrink-0"
                >
                  {patient.health_station_name}
                </Badge>
              </>
            ) : null}
            {/* Progress pill */}
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {filled}/{totalSections} sections
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="min-w-[130px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Save Consultation"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Scrollable form body                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Section 1 — Chief Complaint */}
        <SectionCard
          icon={<ClipboardList className="size-4" />}
          title="Chief Complaint"
          required
        >
          <Field data-invalid={chiefComplaintError ? true : undefined}>
            <FieldLabel htmlFor="chief-complaint" className="sr-only">
              Chief Complaint
            </FieldLabel>
            <textarea
              id="chief-complaint"
              rows={5}
              value={chiefComplaint}
              onChange={(e) => {
                setChiefComplaint(e.target.value);
                if (e.target.value.trim()) setChiefComplaintError("");
              }}
              aria-required="true"
              aria-invalid={chiefComplaintError ? true : undefined}
              aria-describedby={chiefComplaintError ? "chief-complaint-error" : undefined}
              autoFocus
              disabled={isSubmitting}
              placeholder="Describe the patient's chief complaint…"
              className="w-full min-h-[48px] rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            />
            <div className="flex items-center justify-between mt-1">
              {chiefComplaintError ? (
                <FieldError id="chief-complaint-error">{chiefComplaintError}</FieldError>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground tabular-nums">
                {chiefComplaint.length} chars
              </span>
            </div>
          </Field>
        </SectionCard>

        {/* Section 2 — Vitals */}
        <SectionCard
          icon={<Activity className="size-4" />}
          title="Vital Signs"
        >
          <div className="space-y-5">
            {/* Blood Pressure — paired inline layout */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Heart className="size-3.5 text-muted-foreground shrink-0" />
                <label className="text-sm font-medium text-foreground">Blood Pressure</label>
                <VitalStatusBadge status={vitalStatus("bp_systolic", bpSystolic)} />
                {bpSystolic !== "" && bpDiastolic !== "" && (
                  <VitalStatusBadge status={vitalStatus("bp_diastolic", bpDiastolic)} />
                )}
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="bp-systolic"
                    aria-label="Systolic blood pressure"
                    min={RANGES.bp_systolic.min}
                    max={RANGES.bp_systolic.max}
                    step={RANGES.bp_systolic.step}
                    value={bpSystolic}
                    onChange={(e) =>
                      handleVitalChange(e.target.value, setBpSystolic, setBpSystolicError, "bp_systolic")
                    }
                    disabled={isSubmitting}
                    placeholder="Systolic"
                    aria-invalid={bpSystolicError ? true : undefined}
                    aria-describedby={bpSystolicError ? "bp-systolic-error" : undefined}
                    className="min-h-[48px] text-base rounded-lg border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 w-full"
                  />
                  {bpSystolicError && (
                    <p id="bp-systolic-error" role="alert" className="mt-1 text-xs text-destructive">
                      {bpSystolicError}
                    </p>
                  )}
                </div>
                <span className="text-lg font-light text-muted-foreground mt-3">/</span>
                <div className="flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="bp-diastolic"
                    aria-label="Diastolic blood pressure"
                    min={RANGES.bp_diastolic.min}
                    max={RANGES.bp_diastolic.max}
                    step={RANGES.bp_diastolic.step}
                    value={bpDiastolic}
                    onChange={(e) =>
                      handleVitalChange(e.target.value, setBpDiastolic, setBpDiastolicError, "bp_diastolic")
                    }
                    disabled={isSubmitting}
                    placeholder="Diastolic"
                    aria-invalid={bpDiastolicError ? true : undefined}
                    aria-describedby={bpDiastolicError ? "bp-diastolic-error" : undefined}
                    className="min-h-[48px] text-base rounded-lg border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 w-full"
                  />
                  {bpDiastolicError && (
                    <p id="bp-diastolic-error" role="alert" className="mt-1 text-xs text-destructive">
                      {bpDiastolicError}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-4">mmHg</span>
              </div>
            </div>

            {/* Heart Rate + Respiratory Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <VitalRow
                icon={<Activity className="size-3.5" />}
                label="Heart Rate"
                id="heart-rate"
                value={heartRate}
                error={heartRateError}
                vitalKey="heart_rate"
                placeholder="e.g. 72"
                disabled={isSubmitting}
                onChange={(v) => handleVitalChange(v, setHeartRate, setHeartRateError, "heart_rate")}
              />
              <VitalRow
                icon={<Wind className="size-3.5" />}
                label="Respiratory Rate"
                id="respiratory-rate"
                value={respiratoryRate}
                error={respiratoryRateError}
                vitalKey="respiratory_rate"
                placeholder="e.g. 16"
                disabled={isSubmitting}
                onChange={(v) => handleVitalChange(v, setRespiratoryRate, setRespiratoryRateError, "respiratory_rate")}
              />
            </div>

            {/* Temperature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <VitalRow
                icon={<Thermometer className="size-3.5" />}
                label="Temperature"
                id="temperature"
                value={temperature}
                error={temperatureError}
                vitalKey="temperature"
                placeholder="e.g. 36.5"
                disabled={isSubmitting}
                onChange={(v) => handleVitalChange(v, setTemperature, setTemperatureError, "temperature")}
              />
            </div>

            {/* Weight + Height + BMI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <VitalRow
                icon={<Scale className="size-3.5" />}
                label="Weight"
                id="weight"
                value={weight}
                error={weightError}
                vitalKey="weight"
                placeholder="e.g. 60.0"
                disabled={isSubmitting}
                onChange={(v) => handleVitalChange(v, setWeight, setWeightError, "weight")}
              />
              <VitalRow
                icon={<Scale className="size-3.5" />}
                label="Height"
                id="height"
                value={height}
                error={heightError}
                vitalKey="height"
                placeholder="e.g. 160.0"
                disabled={isSubmitting}
                onChange={(v) => handleVitalChange(v, setHeight, setHeightError, "height")}
              />
              {/* BMI (computed, read-only) */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Scale className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground">BMI</span>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className="min-h-[48px] flex items-center px-3 rounded-lg border border-input bg-muted/30 text-base text-muted-foreground cursor-default w-full"
                          aria-label="Computed BMI"
                          aria-readonly="true"
                        >
                          {bmi}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Computed from weight and height</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs text-muted-foreground shrink-0">kg/m²</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Section 3 — Additional Vitals (collapsible) */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none">
              <div className="flex items-center gap-2.5">
                <Droplets className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Additional Vitals
                </span>
                <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0 h-5">
                  Optional
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>

            <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* O2 Saturation */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Droplets className="size-3.5 text-muted-foreground shrink-0" />
                  <label htmlFor="o2-saturation" className="text-sm font-medium text-foreground">
                    O2 Saturation
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="o2-saturation"
                    min={0}
                    max={100}
                    step={1}
                    value={o2Saturation}
                    onChange={(e) => setO2Saturation(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 98"
                    className="min-h-[48px] text-base rounded-lg border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 w-full"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">%</span>
                </div>
              </div>

              {/* Blood Glucose */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Droplets className="size-3.5 text-muted-foreground shrink-0" />
                  <label htmlFor="blood-glucose" className="text-sm font-medium text-foreground">
                    Blood Glucose
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="blood-glucose"
                    min={0}
                    max={1000}
                    step={1}
                    value={bloodGlucose}
                    onChange={(e) => setBloodGlucose(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 95"
                    className="min-h-[48px] text-base rounded-lg border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 w-full"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">mg/dL</span>
                </div>
              </div>
            </div>
          </details>
        </section>

        {/* Section 4 — Assessment */}
        <SectionCard
          icon={<Stethoscope className="size-4" />}
          title="Assessment"
        >
          <Field>
            <FieldLabel htmlFor="diagnosis" className="sr-only">
              Diagnosis
            </FieldLabel>
            <textarea
              id="diagnosis"
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. J00 — Common cold, or free text description"
              className="w-full min-h-[48px] rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-muted-foreground">ICD-10 code or free text diagnosis</p>
          </Field>
        </SectionCard>

        {/* Section 5 — Referral */}
        <SectionCard
          icon={<SendToBack className="size-4" />}
          title="Referral"
        >
          <Field>
            <FieldLabel htmlFor="referring-to" className="sr-only">
              Refer to
            </FieldLabel>
            <Input
              id="referring-to"
              type="text"
              value={referringTo}
              onChange={(e) => setReferringTo(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. District Hospital — Dr. Santos"
              className="min-h-[48px] text-base"
            />
            <p className="mt-1 text-xs text-muted-foreground">Leave blank if no referral is needed</p>
          </Field>
        </SectionCard>

        {/* Bottom action bar (mirrors sticky header for long forms on mobile) */}
        <div className="flex justify-end gap-2 pt-2 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="min-w-[130px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              "Save Consultation"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
