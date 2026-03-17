import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { loginApi, logoutApi } from "@/features/auth/api";
import { getRefreshToken, setRefreshToken, clearTokens, getUserEmail, setUserEmail } from "@/lib/auth";
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
    let mounted = true;
    const restoreSession = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (mounted) setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.post<{
          access_token: string;
          refresh_token: string;
        }>("/auth/refresh", { refresh_token: refreshToken });
        if (!mounted) return;
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        const payload = jwtDecode<JwtPayload>(data.access_token);
        setUser({
          id: parseInt(payload.sub, 10),
          email: getUserEmail(),
          full_name: "",
          roles: payload.roles,
          health_station_id: payload.health_station_id,
          is_active: true,
        });
      } catch {
        if (mounted) clearTokens();
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void restoreSession();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (body: LoginRequest) => {
    const loggedInUser = await loginApi(body);
    setUserEmail(loggedInUser.email);
    setIsLoading(false); // abort any in-flight restoreSession spinner
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    // Clear local state immediately so the UI transitions without waiting on the server
    setUser(null);
    clearTokens();
    setAccessToken("");
    // Fire-and-forget: revoke the session server-side in the background
    if (refreshToken) {
      logoutApi(refreshToken).catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
