export interface UserListItem {
  id: number;
  email: string;
  full_name: string;
  roles: string[];
  health_station_id: number | null;
  is_active: boolean;
  created_at: string; // ISO 8601 string
}

export interface UserCreateRequest {
  email: string;
  full_name: string;
  password: string;
  roles: string[];
  health_station_id: number | null;
}

export interface UserUpdateRequest {
  full_name?: string;
  password?: string; // undefined = no change
  roles?: string[];
  health_station_id?: number | null;
}

export interface AuditLogEntry {
  id: number;
  table_name: string;
  operation: string;
  performed_at: string; // ISO 8601
  new_values: Record<string, unknown>;
}

export const ROLE_OPTIONS = [
  { value: "system_admin", label: "System Administrator" },
  { value: "city_health_officer", label: "City Health Officer" },
  { value: "physician", label: "Physician" },
  { value: "phis_coordinator", label: "PHIS Coordinator" },
  { value: "disease_surveillance_officer", label: "Disease Surveillance Officer" },
  { value: "nurse", label: "Nurse / Midwife" },
  { value: "bhw", label: "Barangay Health Worker" },
] as const;
