import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Droplets,
  Heart,
  Scale,
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
import { Skeleton } from "@/components/ui/skeleton";

import { getConsultation, getPatient } from "@/features/patients/api";
import type { ConsultationResponse, PatientResponse } from "@/features/patients/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

function buildFullName(p: PatientResponse): string {
  return `${p.last_name}, ${p.first_name}${p.middle_name ? ` ${p.middle_name}` : ""}`;
}

function computeBmi(weight: number | null, height: number | null): string {
  if (!weight || !height || height <= 0) return "—";
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonDetailPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-8 w-80" />
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VitalCellProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  unit?: string;
}

function VitalCell({ icon, label, value, unit }: VitalCellProps) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="size-3.5 shrink-0">{icon}</span>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold text-foreground tabular-nums">
          {value ?? "—"}
        </span>
        {unit && value != null && value !== "—" && (
          <span className="text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ConsultationDetailPage() {
  const { id, consultationId } = useParams<{ id: string; consultationId: string }>();
  const navigate = useNavigate();
  const patientId = Number(id);
  const cId = Number(consultationId);

  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [consultation, setConsultation] = useState<ConsultationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId || isNaN(patientId) || !cId || isNaN(cId)) {
      setError("Invalid URL.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const [patientData, consultationData] = await Promise.all([
          getPatient(patientId),
          getConsultation(patientId, cId),
        ]);
        if (cancelled) return;
        setPatient(patientData);
        setConsultation(consultationData);
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status: number } })?.response?.status;
        if (status === 404) {
          setError("Consultation not found.");
        } else {
          setError("Could not load consultation. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [patientId, cId]);

  const fullName = patient ? buildFullName(patient) : `Patient #${patientId}`;
  const dateLabel = consultation ? formatDateShort(consultation.created_at) : "Consultation";

  // ---- Loading state -------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SkeletonDetailPage />
      </div>
    );
  }

  // ---- Error state ---------------------------------------------------------
  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to="/patients" />}>Patients</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to={`/patients/${patientId}`} />}>
                  {fullName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Consultation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
            <p className="text-base font-semibold text-foreground">
              {error ?? "Consultation not found."}
            </p>
            <button
              onClick={() => navigate(`/patients/${patientId}`)}
              className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Back to Patient
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Derived vitals display values ----------------------------------------
  const bpValue =
    consultation.bp_systolic != null && consultation.bp_diastolic != null
      ? `${consultation.bp_systolic} / ${consultation.bp_diastolic}`
      : consultation.bp_systolic != null
        ? `${consultation.bp_systolic} / —`
        : consultation.bp_diastolic != null
          ? `— / ${consultation.bp_diastolic}`
          : "—";

  const bmi = computeBmi(
    consultation.weight != null ? Number(consultation.weight) : null,
    consultation.height != null ? Number(consultation.height) : null
  );

  const o2Sat = consultation.vitals_extra?.o2_saturation != null
    ? String(consultation.vitals_extra.o2_saturation)
    : null;
  const bloodGlucose = consultation.vitals_extra?.blood_glucose != null
    ? String(consultation.vitals_extra.blood_glucose)
    : null;

  // =========================================================================
  // Render — main
  // =========================================================================
  return (
    <div className="min-h-screen bg-background login-page-enter">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/patients" />}>Patients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to={`/patients/${patientId}`} />}>
                {fullName}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{dateLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page title + back button */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-[1.2] text-foreground">
              {formatDateTime(consultation.created_at)}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/patients/${patientId}`)}
            className="gap-1.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient
          </Button>
        </div>

        {/* Section 1 — Header card: patient + recorded by */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base font-semibold text-foreground">{fullName}</span>
            {patient && (
              <Badge
                variant="outline"
                className="text-xs bg-[color:var(--bhs-tier,hsl(var(--primary)))]/10 text-[color:var(--bhs-tier,hsl(var(--primary)))] border-[color:var(--bhs-tier,hsl(var(--primary)))]/30"
              >
                {patient.health_station_name}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">Recorded by:</span>{" "}
              {consultation.recorded_by_name}
            </span>
            <span>
              <span className="font-medium text-foreground">Date:</span>{" "}
              {formatDateTime(consultation.created_at)}
            </span>
          </div>
        </section>

        {/* Section 2 — Chief Complaint */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
            <Stethoscope className="size-4 text-muted-foreground shrink-0" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Chief Complaint
            </h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {consultation.chief_complaint}
            </p>
          </div>
        </section>

        {/* Section 3 — Vitals */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
            <Activity className="size-4 text-muted-foreground shrink-0" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Vital Signs
            </h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* BP spans full width on mobile for the paired display */}
            <div className="col-span-2 sm:col-span-1">
              <VitalCell
                icon={<Heart className="size-3.5" />}
                label="Blood Pressure"
                value={bpValue !== "—" ? bpValue : null}
                unit="mmHg"
              />
            </div>
            <VitalCell
              icon={<Activity className="size-3.5" />}
              label="Heart Rate"
              value={consultation.heart_rate != null ? String(consultation.heart_rate) : null}
              unit="bpm"
            />
            <VitalCell
              icon={<Wind className="size-3.5" />}
              label="Resp. Rate"
              value={consultation.respiratory_rate != null ? String(consultation.respiratory_rate) : null}
              unit="br/min"
            />
            <VitalCell
              icon={<Thermometer className="size-3.5" />}
              label="Temperature"
              value={consultation.temperature != null ? String(consultation.temperature) : null}
              unit="°C"
            />
            <VitalCell
              icon={<Scale className="size-3.5" />}
              label="Weight"
              value={consultation.weight != null ? String(consultation.weight) : null}
              unit="kg"
            />
            <VitalCell
              icon={<Scale className="size-3.5" />}
              label="Height"
              value={consultation.height != null ? String(consultation.height) : null}
              unit="cm"
            />
            <VitalCell
              icon={<Scale className="size-3.5" />}
              label="BMI"
              value={bmi !== "—" ? bmi : null}
              unit="kg/m²"
            />
            {o2Sat != null && (
              <VitalCell
                icon={<Droplets className="size-3.5" />}
                label="O2 Saturation"
                value={o2Sat}
                unit="%"
              />
            )}
            {bloodGlucose != null && (
              <VitalCell
                icon={<Droplets className="size-3.5" />}
                label="Blood Glucose"
                value={bloodGlucose}
                unit="mg/dL"
              />
            )}
          </div>
        </section>

        {/* Section 4 — Assessment */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
            <Stethoscope className="size-4 text-muted-foreground shrink-0" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Assessment
            </h2>
          </div>
          <div className="px-5 py-4">
            {consultation.diagnosis ? (
              <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {consultation.diagnosis}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No diagnosis recorded.</p>
            )}
          </div>
        </section>

        {/* Section 5 — Referral */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/30">
            <Activity className="size-4 text-muted-foreground shrink-0" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Referral
            </h2>
          </div>
          <div className="px-5 py-4">
            {consultation.referring_to ? (
              <p className="text-base text-foreground">{consultation.referring_to}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No referral.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
