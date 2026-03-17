import api, { setAccessToken } from "@/lib/axios";
import { setRefreshToken, clearTokens } from "@/lib/auth";
import type { LoginRequest, TokenResponse, UserSchema } from "./types";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  sub: string;
  roles: string[];
  health_station_id: number | null;
}

export async function loginApi(body: LoginRequest): Promise<UserSchema> {
  const { data } = await api.post<TokenResponse>("/auth/login", body);
  setAccessToken(data.access_token);
  setRefreshToken(data.refresh_token);
  // Decode user info from access token payload (no DB round-trip needed)
  const payload = jwtDecode<JwtPayload>(data.access_token);
  return {
    id: parseInt(payload.sub, 10),
    email: body.email,
    full_name: "", // not in JWT payload; will be populated from /admin/users if needed
    roles: payload.roles,
    health_station_id: payload.health_station_id,
    is_active: true,
  };
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refresh_token: refreshToken });
  clearTokens();
}
