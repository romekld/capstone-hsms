export interface PatientListItem {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  birthdate: string; // ISO date "YYYY-MM-DD"
  sex: "male" | "female";
  health_station_id: number;
  health_station_name: string;
  possible_duplicate: boolean;
  created_at: string; // ISO 8601 datetime
  full_name: string; // computed by backend
}

export interface PatientResponse {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  birthdate: string;
  sex: "male" | "female";
  barangay_psgc_code: string;
  barangay_name: string;
  address_line: string | null;
  health_station_id: number;
  health_station_name: string;
  mobile_number: string | null;
  possible_duplicate: boolean;
  created_at: string;
  updated_at: string;
  age: number; // computed by backend
}

export interface PatientCreateRequest {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  birthdate: string; // "YYYY-MM-DD"
  sex: "male" | "female";
  barangay_psgc_code: string;
  address_line?: string | null;
  mobile_number?: string | null;
  force_duplicate?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type PatientSearchResponse = PaginatedResponse<PatientListItem>;

export interface DuplicateCheckResult {
  has_duplicate: boolean;
  existing_patient: PatientListItem | null;
}

export interface ConsultationResponse {
  id: number;
  patient_id: number;
  recorded_by: number;
  recorded_by_name: string;
  chief_complaint: string;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  vitals_extra: Record<string, unknown> | null;
  diagnosis: string | null;
  referring_to: string | null;
  created_at: string;
  bmi: number | null; // computed by backend
}

export interface ConsultationCreateRequest {
  chief_complaint: string;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  heart_rate?: number | null;
  respiratory_rate?: number | null;
  temperature?: number | null;
  weight?: number | null;
  height?: number | null;
  vitals_extra?: Record<string, unknown> | null;
  diagnosis?: string | null;
  referring_to?: string | null;
}

export type ConsultationListResponse = PaginatedResponse<ConsultationResponse>;

// Barangay option for registration form select
export interface BarangayOption {
  psgc_code: string;
  name: string;
}
