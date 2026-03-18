import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUp, ArrowDown, PlusCircle } from "lucide-react";

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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast as sonnerToast } from "sonner";

import { getPatient, listConsultations } from "@/features/patients/api";
import type { PatientResponse, ConsultationResponse } from "@/features/patients/types";
import { useAuth } from "@/hooks/useAuth";
import { ConsultationSheet } from "./ConsultationSheet";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

// Roles that can write consultations on their own BHS patients
const CONSULTATION_WRITE_ROLES = ["nurse", "midwife", "physician"] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBirthdate(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

function buildFullName(patient: PatientResponse): string {
  const middle = patient.middle_name ? ` ${patient.middle_name}` : "";
  return `${patient.last_name}, ${patient.first_name}${middle}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonHeaderCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <Skeleton className="h-7 w-64" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

function SkeletonTableRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

type SortDirection = "asc" | "desc";

interface SortIconProps {
  direction: SortDirection;
  active: boolean;
}

function SortIcon({ direction, active }: SortIconProps) {
  if (!active) return null;
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 ml-1 inline" />
  ) : (
    <ArrowDown className="h-3 w-3 ml-1 inline" />
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const patientId = Number(id);

  // ---- Patient data -------------------------------------------------------
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);

  // ---- Consultations data -------------------------------------------------
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [consultationsLoading, setConsultationsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // ---- Sheet state --------------------------------------------------------
  const [showConsultationSheet, setShowConsultationSheet] = useState(false);

  // ---- Fetch patient -------------------------------------------------------
  useEffect(() => {
    if (!patientId || isNaN(patientId)) {
      setPatientError("Invalid patient ID.");
      setPatientLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const data = await getPatient(patientId);
        if (cancelled) return;
        setPatient(data);
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status: number } })?.response?.status;
        if (status === 404) {
          setPatientError("Patient not found.");
        } else {
          setPatientError("Could not load patient record. Check your connection and try again.");
        }
      } finally {
        if (!cancelled) setPatientLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [patientId]);

  // ---- Fetch consultations ------------------------------------------------
  const fetchConsultations = async () => {
    if (!patientId || isNaN(patientId)) return;
    setConsultationsLoading(true);
    try {
      const data = await listConsultations(patientId, page, PAGE_SIZE);
      setConsultations(data.items);
      setTotalPages(data.total_pages);
    } catch {
      sonnerToast.error("Could not load consultations. Please try again.");
    } finally {
      setConsultationsLoading(false);
    }
  };

  useEffect(() => {
    void fetchConsultations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, page]);

  // ---- Access control -----------------------------------------------------
  // Check if current user is a BHS-level role viewing another BHS patient
  const isWriteRole =
    user?.roles.some((r) => CONSULTATION_WRITE_ROLES.includes(r as (typeof CONSULTATION_WRITE_ROLES)[number])) ??
    false;
  const isViewOnly =
    isWriteRole &&
    patient !== null &&
    user?.health_station_id !== null &&
    user?.health_station_id !== patient.health_station_id;

  // Add Consultation button visible for nurse/midwife/physician at own BHS
  const canAddConsultation = isWriteRole && !isViewOnly;

  // ---- Sort ---------------------------------------------------------------
  const sortedConsultations = [...consultations].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortDirection === "asc" ? diff : -diff;
  });

  const toggleSort = () => setSortDirection((d) => (d === "asc" ? "desc" : "asc"));

  // ---- Full name ----------------------------------------------------------
  const fullName = patient ? buildFullName(patient) : "";

  // ---- Refresh callback ---------------------------------------------------
  const refreshConsultations = () => {
    void fetchConsultations();
  };

  // =========================================================================
  // Render — error state
  // =========================================================================
  if (!patientLoading && patientError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to="/patients" />}>Patients</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Patient Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
            <p className="text-base font-semibold text-foreground">{patientError}</p>
            <Link
              to="/patients"
              className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Back to Patients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Render — main
  // =========================================================================
  return (
    <div className="min-h-screen bg-background login-page-enter">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Breadcrumb */}
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
                <BreadcrumbPage>{fullName}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page h1 */}
        {patientLoading ? (
          <Skeleton className="h-9 w-72" />
        ) : (
          <h1 className="text-[1.75rem] font-semibold leading-[1.2] text-foreground">
            {fullName}
          </h1>
        )}

        {/* Profile header card */}
        {patientLoading ? (
          <SkeletonHeaderCard />
        ) : patient ? (
          <div className="rounded-xl border border-border bg-card p-6">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {patient.possible_duplicate && (
                <Badge
                  className="text-xs font-medium bg-[color:var(--status-critical)]/15 text-[color:var(--status-critical)] border-[color:var(--status-critical)]/30"
                  variant="outline"
                >
                  Possible Duplicate
                </Badge>
              )}
              {isViewOnly && (
                <Badge
                  className="text-xs font-medium bg-[color:var(--status-warning)]/15 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30"
                  variant="outline"
                >
                  View Only — this patient belongs to {patient.health_station_name}
                </Badge>
              )}
            </div>

            {/* Identity fields */}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">Birthdate</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {formatBirthdate(patient.birthdate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">Sex</dt>
                <dd className="mt-0.5">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {patient.sex}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">Age</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {patient.age} years old
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground uppercase tracking-wide">Health Station</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {patient.health_station_name}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {/* Tabs */}
        <Tabs defaultValue="consultations">
          <TabsList>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="mt-4">
            {/* Tab header: title + Add Consultation button */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Consultations</h2>
              {canAddConsultation && (
                <Button
                  onClick={() => setShowConsultationSheet(true)}
                  className="gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" data-icon="inline-start" />
                  Add Consultation
                </Button>
              )}
            </div>

            {/* Consultations table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={toggleSort}
                      aria-label="Sort by Date"
                    >
                      Date{" "}
                      <SortIcon direction={sortDirection} active={true} />
                    </TableHead>
                    <TableHead>Chief Complaint</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Referring To</TableHead>
                    <TableHead>Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultationsLoading ? (
                    <SkeletonTableRows />
                  ) : sortedConsultations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-16 text-center">
                        <p className="text-base font-semibold text-foreground">
                          No consultations recorded
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Add the first consultation record for this patient.
                        </p>
                        {canAddConsultation && (
                          <Button
                            className="mt-4"
                            onClick={() => setShowConsultationSheet(true)}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Consultation
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedConsultations.map((c) => (
                      <TableRow key={c.id} style={{ minHeight: "44px" }}>
                        <TableCell className="text-xs text-muted-foreground font-mono py-3 whitespace-nowrap">
                          {formatDateTime(c.created_at)}
                        </TableCell>
                        <TableCell className="py-3 max-w-[200px]">
                          <span className="line-clamp-2 text-sm">{c.chief_complaint}</span>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground max-w-[160px]">
                          <span className="line-clamp-2">{c.diagnosis ?? "—"}</span>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {c.referring_to ?? "—"}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {c.recorded_by_name}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page <= 1}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm text-muted-foreground px-4 py-2">
                        Page {page} of {totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-disabled={page >= totalPages}
                        className={
                          page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Consultation Sheet */}
        {patient && (
          <ConsultationSheet
            open={showConsultationSheet}
            onOpenChange={setShowConsultationSheet}
            patientId={patient.id}
            patientName={fullName}
            healthStationName={patient.health_station_name}
            onSuccess={refreshConsultations}
          />
        )}
      </div>
    </div>
  );
}
