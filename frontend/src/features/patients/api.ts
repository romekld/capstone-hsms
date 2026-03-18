import api from "@/lib/axios";
import type {
  PatientSearchResponse,
  PatientResponse,
  PatientCreateRequest,
  DuplicateCheckResult,
  ConsultationResponse,
  ConsultationCreateRequest,
  ConsultationListResponse,
} from "./types";

export async function searchPatients(
  q: string,
  cityWide: boolean = false,
  page: number = 1,
  pageSize: number = 20
): Promise<PatientSearchResponse> {
  const { data } = await api.get<PatientSearchResponse>("/patients", {
    params: { q, city_wide: cityWide, page, page_size: pageSize },
  });
  return data;
}

export async function getPatient(id: number): Promise<PatientResponse> {
  const { data } = await api.get<PatientResponse>(`/patients/${id}`);
  return data;
}

export async function registerPatient(
  body: PatientCreateRequest
): Promise<PatientResponse> {
  const { data } = await api.post<PatientResponse>("/patients", body);
  return data;
}

export async function checkDuplicate(
  lastName: string,
  firstName: string,
  birthdate: string
): Promise<DuplicateCheckResult> {
  const { data } = await api.get<DuplicateCheckResult>(
    "/patients/check-duplicate",
    {
      params: {
        last_name: lastName,
        first_name: firstName,
        birthdate,
      },
    }
  );
  return data;
}

export async function createConsultation(
  patientId: number,
  body: ConsultationCreateRequest
): Promise<ConsultationResponse> {
  const { data } = await api.post<ConsultationResponse>(
    `/patients/${patientId}/consultations`,
    body
  );
  return data;
}

export async function listConsultations(
  patientId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<ConsultationListResponse> {
  const { data } = await api.get<ConsultationListResponse>(
    `/patients/${patientId}/consultations`,
    { params: { page, page_size: pageSize } }
  );
  return data;
}
