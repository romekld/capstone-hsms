import api from "@/lib/axios";
import type { HealthStation } from "./types";

// axios baseURL is /api — full path resolves to GET /api/health-stations (no trailing slash)
export async function listHealthStations(): Promise<HealthStation[]> {
  const { data } = await api.get<HealthStation[]>("/health-stations");
  return data;
}
