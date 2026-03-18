import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { createConsultation } from "@/features/patients/api";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ConsultationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  patientName: string;
  healthStationName: string;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// BMI helper
// ---------------------------------------------------------------------------

function computeBmi(weight: string, height: string): string {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h || h <= 0) return "--";
  const bmi = w / Math.pow(h / 100, 2);
  return bmi.toFixed(1);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConsultationSheet({
  open,
  onOpenChange,
  patientId,
  patientName,
  healthStationName,
  onSuccess,
}: ConsultationSheetProps) {
  // ---- Form state ----------------------------------------------------------
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [chiefComplaintError, setChiefComplaintError] = useState("");

  // Core vitals
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Additional vitals (collapsible)
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [o2Saturation, setO2Saturation] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");

  // Assessment & referral
  const [diagnosis, setDiagnosis] = useState("");
  const [referringTo, setReferringTo] = useState("");

  // Async state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Reset when sheet opens ---------------------------------------------
  useEffect(() => {
    if (open) {
      setChiefComplaint("");
      setChiefComplaintError("");
      setBpSystolic("");
      setBpDiastolic("");
      setHeartRate("");
      setRespiratoryRate("");
      setTemperature("");
      setWeight("");
      setHeight("");
      setAdditionalOpen(false);
      setO2Saturation("");
      setBloodGlucose("");
      setDiagnosis("");
      setReferringTo("");
    }
  }, [open]);

  // ---- Live BMI -----------------------------------------------------------
  const bmi = computeBmi(weight, height);

  // ---- Submit -------------------------------------------------------------
  const handleSubmit = async () => {
    // Validate required
    if (!chiefComplaint.trim()) {
      setChiefComplaintError("Chief complaint is required.");
      return;
    }
    setChiefComplaintError("");
    setIsSubmitting(true);

    try {
      // Build vitals_extra from additional vitals section (only include non-null values)
      const vitalsExtra: Record<string, unknown> = {};
      if (o2Saturation !== "") vitalsExtra.o2_saturation = parseFloat(o2Saturation);
      if (bloodGlucose !== "") vitalsExtra.blood_glucose = parseFloat(bloodGlucose);

      await createConsultation(patientId, {
        chief_complaint: chiefComplaint.trim(),
        bp_systolic: bpSystolic !== "" ? parseInt(bpSystolic, 10) : null,
        bp_diastolic: bpDiastolic !== "" ? parseInt(bpDiastolic, 10) : null,
        heart_rate: heartRate !== "" ? parseInt(heartRate, 10) : null,
        respiratory_rate: respiratoryRate !== "" ? parseInt(respiratoryRate, 10) : null,
        temperature: temperature !== "" ? parseFloat(temperature) : null,
        weight: weight !== "" ? parseFloat(weight) : null,
        height: height !== "" ? parseFloat(height) : null,
        vitals_extra: Object.keys(vitalsExtra).length > 0 ? vitalsExtra : null,
        diagnosis: diagnosis.trim() || null,
        referring_to: referringTo.trim() || null,
      });

      toast.success("Consultation saved.");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Could not save consultation. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Shared input style for vitals (48px height, 16px font) -------------
  const vitalsInputClass =
    "min-h-[48px] text-base rounded-lg border border-input bg-transparent px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 w-full";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="sm:max-w-[540px] overflow-y-auto flex flex-col gap-0 p-0"
        side="right"
        showCloseButton={true}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------ */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-lg font-semibold">New Consultation</SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Patient:</span>
              <span className="text-sm font-medium text-foreground">{patientName}</span>
              <Badge
                variant="outline"
                className="text-xs bg-[color:var(--bhs-tier)]/10 text-[color:var(--bhs-tier)] border-[color:var(--bhs-tier)]/30"
              >
                {healthStationName}
              </Badge>
            </div>
          </SheetDescription>
        </SheetHeader>

        {/* ------------------------------------------------------------------ */}
        {/* Form body                                                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Section 1 — Chief Complaint */}
          <FieldSet>
            <FieldLegend variant="label">Chief Complaint</FieldLegend>
            <Field data-invalid={chiefComplaintError ? true : undefined}>
              <FieldLabel htmlFor="chief-complaint">
                Chief Complaint <span aria-hidden="true">*</span>
              </FieldLabel>
              <textarea
                id="chief-complaint"
                rows={3}
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
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                placeholder="Describe the patient's chief complaint..."
              />
              {chiefComplaintError && (
                <FieldError id="chief-complaint-error">{chiefComplaintError}</FieldError>
              )}
            </Field>
          </FieldSet>

          {/* Section 2 — Vitals */}
          <FieldSet>
            <FieldLegend variant="label">Vitals</FieldLegend>
            <div
              className="rounded-lg border border-border p-4 space-y-4"
              style={{ background: "var(--card)" }}
            >
              {/* Blood Pressure — paired inputs */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Blood Pressure
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="bp-systolic"
                    aria-label="Systolic blood pressure"
                    min={40}
                    max={300}
                    step={1}
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Systolic"
                    className={vitalsInputClass}
                  />
                  <span className="text-muted-foreground font-medium shrink-0">/</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    id="bp-diastolic"
                    aria-label="Diastolic blood pressure"
                    min={20}
                    max={200}
                    step={1}
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Diastolic"
                    className={vitalsInputClass}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">mmHg</span>
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <label htmlFor="heart-rate" className="block text-sm font-medium text-foreground mb-1.5">
                  Heart Rate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="heart-rate"
                    min={20}
                    max={300}
                    step={1}
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 72"
                    className={vitalsInputClass}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">bpm</span>
                </div>
              </div>

              {/* Respiratory Rate */}
              <div>
                <label htmlFor="respiratory-rate" className="block text-sm font-medium text-foreground mb-1.5">
                  Respiratory Rate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="respiratory-rate"
                    min={4}
                    max={80}
                    step={1}
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 16"
                    className={vitalsInputClass}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">breaths/min</span>
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-foreground mb-1.5">
                  Temperature
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="temperature"
                    min={30.0}
                    max={45.0}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 36.5"
                    className={vitalsInputClass}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">°C</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-foreground mb-1.5">
                  Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="weight"
                    min={0.5}
                    max={500}
                    step={0.1}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 60.0"
                    className={vitalsInputClass}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">kg</span>
                </div>
              </div>

              {/* Height */}
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-foreground mb-1.5">
                  Height
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    id="height"
                    min={20}
                    max={300}
                    step={0.1}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 160.0"
                    className={vitalsInputClass}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">cm</span>
                </div>
              </div>

              {/* BMI (computed display) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  BMI
                </label>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="min-h-[48px] flex items-center px-3 rounded-lg border border-input bg-muted/30 text-base text-muted-foreground cursor-default w-full"
                          aria-label="Computed BMI"
                          aria-readonly="true"
                        >
                          {bmi}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Computed from weight and height
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs text-muted-foreground shrink-0">kg/m²</span>
                </div>
              </div>
            </div>
          </FieldSet>

          {/* Section 3 — Additional Vitals (Collapsible) */}
          <FieldSet>
            <Collapsible open={additionalOpen} onOpenChange={setAdditionalOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-expanded={additionalOpen}
                >
                  <span>
                    {additionalOpen ? "Hide additional vitals" : "Show additional vitals"}
                  </span>
                  {additionalOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div
                  className="mt-3 rounded-lg border border-border p-4 space-y-4"
                  style={{ background: "var(--card)" }}
                >
                  {/* O2 Saturation */}
                  <div>
                    <label htmlFor="o2-saturation" className="block text-sm font-medium text-foreground mb-1.5">
                      O2 Saturation
                    </label>
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
                        className={vitalsInputClass}
                      />
                      <span className="text-xs text-muted-foreground shrink-0">%</span>
                    </div>
                  </div>

                  {/* Blood Glucose */}
                  <div>
                    <label htmlFor="blood-glucose" className="block text-sm font-medium text-foreground mb-1.5">
                      Blood Glucose
                    </label>
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
                        className={vitalsInputClass}
                      />
                      <span className="text-xs text-muted-foreground shrink-0">mg/dL</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </FieldSet>

          {/* Section 4 — Assessment */}
          <FieldSet>
            <FieldLegend variant="label">Assessment</FieldLegend>
            <Field>
              <FieldLabel htmlFor="diagnosis">
                Diagnosis (ICD-10 or description)
              </FieldLabel>
              <textarea
                id="diagnosis"
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                placeholder="e.g. J00 — Common cold, or free text description"
              />
            </Field>
          </FieldSet>

          {/* Section 5 — Referral */}
          <FieldSet>
            <FieldLegend variant="label">Referral</FieldLegend>
            <Field>
              <FieldLabel htmlFor="referring-to">
                Refer to (if applicable)
              </FieldLabel>
              <Input
                id="referring-to"
                type="text"
                value={referringTo}
                onChange={(e) => setReferringTo(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. District Hospital — Dr. Santos"
              />
            </Field>
          </FieldSet>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Footer                                                              */}
        {/* ------------------------------------------------------------------ */}
        <SheetFooter className="border-t border-border px-6 py-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Consultation"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
