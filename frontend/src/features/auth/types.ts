export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserSchema {
  id: number;
  email: string;
  full_name: string;
  roles: string[];
  health_station_id: number | null;
  is_active: boolean;
}
