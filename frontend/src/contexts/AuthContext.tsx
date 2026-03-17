import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { loginApi, logoutApi } from "@/features/auth/api";
import { getRefreshToken, clearTokens } from "@/lib/auth";
import api, { setAccessToken } from "@/lib/axios";
import type { LoginRequest, UserSchema } from "@/features/auth/types";

interface AuthContextValue {
  user: UserSchema | null;
  isLoading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface JwtPayload {
  sub: string;
  roles: string[];
  health_station_id: number | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app mount: attempt silent token refresh if refresh token exists.
  // Uses a top-level async function (no chained promise callbacks) to prevent race conditions with the 401 interceptor.
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.post<{
          access_token: string;
          refresh_token: string;
        }>("/auth/refresh", { refresh_token: refreshToken });
        setAccessToken(data.access_token);
        const payload = jwtDecode<JwtPayload>(data.access_token);
        setUser({
          id: parseInt(payload.sub, 10),
          email: "",
          full_name: "",
          roles: payload.roles,
          health_station_id: payload.health_station_id,
          is_active: true,
        });
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const loggedInUser = await loginApi(body);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await logoutApi(refreshToken).catch(() => {});
    }
    setUser(null);
    clearTokens();
    setAccessToken("");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
