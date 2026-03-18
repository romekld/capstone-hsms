import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, UserPlus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { searchPatients } from "@/features/patients/api";
import type { PatientListItem } from "@/features/patients/types";
import { useAuth } from "@/hooks/useAuth";

// Roles that see city-wide data by default — no toggle needed
const CROSS_BHS_ROLES = [
  "city_health_officer",
  "phis_coordinator",
  "disease_surveillance_officer",
] as const;

type SortField = "full_name" | "birthdate" | "sex" | "health_station_name" | "created_at";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 20;

// SortIcon must be declared outside the page component to avoid "component created during render" lint error
interface SortIconProps {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}

function SortIcon({ field, sortField, sortDirection }: SortIconProps) {
  if (sortField !== field) return null;
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3 ml-1 inline" />
  ) : (
    <ArrowDown className="h-3 w-3 ml-1 inline" />
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(iso));
}

export function PatientsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine if user has cross-BHS access (no toggle needed)
  const isCrossBhsUser = CROSS_BHS_ROLES.some((r) =>
    user?.roles.includes(r)
  );

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cityWide, setCityWide] = useState(isCrossBhsUser);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // 300ms debounce on search input — also resets page on new query
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch patients whenever search params change
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await searchPatients(debouncedQuery, cityWide, page, PAGE_SIZE);
        if (cancelled) return;
        setPatients(res.items);
        setTotalPages(res.total_pages);
        setTotal(res.total);
        setIsLoading(false);
      } catch {
        if (cancelled) return;
        setIsLoading(false);
        toast.error("Failed to load patients. Please try again.");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, cityWide, page]);

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle city-wide toggle change — also resets to page 1
  const handleCityWideChange = (checked: boolean) => {
    setCityWide(checked);
    setPage(1);
  };

  // Handle query change — reset page
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  // Client-side sort
  const sorted = [...patients].sort((a, b) => {
    const av = String(a[sortField] ?? "");
    const bv = String(b[sortField] ?? "");
    const cmp = av.localeCompare(bv);
    return sortDirection === "asc" ? cmp : -cmp;
  });

  const hasNoPatients = !isLoading && patients.length === 0 && debouncedQuery === "";
  const hasNoResults = !isLoading && patients.length === 0 && debouncedQuery !== "";
  const showBhsColumn = cityWide || isCrossBhsUser;
  const colSpan = showBhsColumn ? 5 : 4;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-[1.75rem] font-semibold leading-[1.2] text-foreground">
            Patients
          </h1>
          <Button
            onClick={() => navigate("/patients/new")}
            className="sm:w-auto w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Register Patient
          </Button>
        </div>

        {/* Search toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
          <div className="relative flex-1 max-w-full sm:max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or patient ID"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-9"
              aria-label="Search patients"
            />
          </div>

          {/* City-wide toggle — hidden for cross-BHS roles */}
          {!isCrossBhsUser && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="city-wide"
                checked={cityWide}
                onCheckedChange={(checked) => handleCityWideChange(checked === true)}
              />
              <Label htmlFor="city-wide" className="text-sm cursor-pointer select-none">
                Search all BHS
              </Label>
            </div>
          )}
        </div>

        {/* Results summary */}
        {!isLoading && total > 0 && (
          <p className="text-sm text-muted-foreground mb-3">
            {total} patient{total !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("full_name")}
                >
                  Patient Name{" "}
                  <SortIcon field="full_name" sortField={sortField} sortDirection={sortDirection} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("birthdate")}
                >
                  Birthdate{" "}
                  <SortIcon field="birthdate" sortField={sortField} sortDirection={sortDirection} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("sex")}
                >
                  Sex{" "}
                  <SortIcon field="sex" sortField={sortField} sortDirection={sortDirection} />
                </TableHead>
                {/* BHS column — visible when city-wide scope is active */}
                {showBhsColumn && (
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("health_station_name")}
                  >
                    BHS{" "}
                    <SortIcon
                      field="health_station_name"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </TableHead>
                )}
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("created_at")}
                >
                  Registered{" "}
                  <SortIcon field="created_at" sortField={sortField} sortDirection={sortDirection} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : hasNoPatients ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-16 text-center">
                    <p className="text-base font-semibold text-foreground">
                      No patients registered yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Register your first patient to get started.
                    </p>
                    <Button className="mt-4" onClick={() => navigate("/patients/new")}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register Patient
                    </Button>
                  </TableCell>
                </TableRow>
              ) : hasNoResults ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-16 text-center">
                    <p className="text-base font-semibold text-foreground">
                      No patients found
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try a different name or patient ID. Use &ldquo;Search all BHS&rdquo; to search
                      across all health stations.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    style={{ minHeight: "44px" }}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell className="font-medium py-3">
                      {patient.full_name}
                      {patient.possible_duplicate && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-[color:var(--status-warning)]/15 text-[color:var(--status-warning)] border-[color:var(--status-warning)]/30"
                        >
                          Possible duplicate
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm py-3">
                      {formatDate(patient.birthdate)}
                    </TableCell>
                    <TableCell className="text-sm capitalize py-3">
                      {patient.sex}
                    </TableCell>
                    {showBhsColumn && (
                      <TableCell className="py-3">
                        <Badge
                          className="text-xs bg-[color:var(--bhs-tier)]/15 text-[color:var(--bhs-tier)] border-[color:var(--bhs-tier)]/30"
                          variant="outline"
                        >
                          {patient.health_station_name}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-xs text-muted-foreground font-mono py-3">
                      {formatDate(patient.created_at)}
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
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
