---
phase: 02-authentication-rbac-user-management
plan: "05b"
type: execute
wave: 4
depends_on:
  - "02-05"
files_modified:
  - frontend/src/lib/axios.ts
  - frontend/src/lib/auth.ts
  - frontend/src/contexts/AuthContext.tsx
  - frontend/src/hooks/useAuth.ts
  - frontend/src/components/ProtectedRoute.tsx
  - frontend/src/features/auth/types.ts
  - frontend/src/features/auth/api.ts
  - frontend/src/App.tsx
  - frontend/src/main.tsx
autonomous: true
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-07

must_haves:
  truths:
    - "Axios client sends Authorization: Bearer {access_token} on every request automatically"
    - "Axios interceptor catches 401, calls POST /api/auth/refresh, retries original request"
    - "AuthContext exposes user, login(), logout(), and isLoading state"
    - "ProtectedRoute redirects unauthenticated users to /login"
    - "ProtectedRoute redirects users without required roles to /unauthorized"
    - "App.tsx has router skeleton with /login, /dashboard, /admin/users routes"
    - "main.tsx wraps App in AuthProvider"
    - "npm run typecheck exits 0"
  artifacts:
    - path: "frontend/src/lib/axios.ts"
      provides: "Axios instance with 401 interceptor and token refresh queue"
      contains: "isRefreshing"
    - path: "frontend/src/lib/auth.ts"
      provides: "Token storage helpers (refresh token in localStorage, access token in memory)"
      contains: "getRefreshToken"
    - path: "frontend/src/contexts/AuthContext.tsx"
      provides: "Auth state provider"
      contains: "AuthProvider"
    - path: "frontend/src/components/ProtectedRoute.tsx"
      provides: "Route guard component"
      contains: "ProtectedRoute"
  key_links:
    - from: "frontend/src/lib/axios.ts"
      to: "POST /api/auth/refresh"
      via: "401 interceptor"
      pattern: "/auth/refresh"
    - from: "frontend/src/contexts/AuthContext.tsx"
      to: "frontend/src/lib/axios.ts"
      via: "api.post('/auth/login')"
      pattern: "auth/login"
    - from: "frontend/src/main.tsx"
      to: "frontend/src/contexts/AuthContext.tsx"
      via: "AuthProvider wrapper"
      pattern: "AuthProvider"
---

<objective>
Build the auth infrastructure layer on top of the scaffold created in Plan 02-05: Axios client with 401 refresh interceptor, token storage helpers, AuthContext with login/logout/isLoading, useAuth hook, ProtectedRoute, auth types, auth API module, and the App router skeleton.

Purpose: Plans 02-06 and 02-07 depend on AuthContext, Axios, and ProtectedRoute existing. This plan delivers all the contracts that login and admin UI pages consume.
Output: Typed auth client; AuthContext with login/logout; ProtectedRoute guard; router skeleton in App.tsx.
</objective>

<execution_context>
@C:/Users/jerom/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/jerom/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-authentication-rbac-user-management/02-CONTEXT.md
@.planning/phases/02-authentication-rbac-user-management/02-RESEARCH.md

<interfaces>
Backend auth endpoints (from Plan 02-03):
- POST /api/auth/login   body: {email, password}           → {access_token, refresh_token, token_type}
- POST /api/auth/refresh body: {refresh_token}             → {access_token, refresh_token, token_type}
- POST /api/auth/logout  body: {refresh_token}             → 204 No Content

Token storage decision (from RESEARCH.md):
- Access token: memory only (React Context state — never localStorage)
- Refresh token: localStorage (acceptable for internal deployment threat model)
- NEVER store access token in localStorage

From Plan 02-05 SUMMARY (scaffold now complete):
- frontend/components.json exists; @/components/ui/ alias works
- frontend/src/styles/globals.css has OKLCH tokens
- frontend/src/main.tsx has font imports and globals.css import
- All shadcn components installed (button, dialog, etc.)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Auth types, token storage helpers, Axios client with 401 interceptor, auth API module</name>
  <read_first>
    - frontend/src/main.tsx (current content after Plan 02-05 — verify globals.css import path)
    - frontend/components.json (confirm @/components/ui/ prefix)
    - .planning/phases/02-authentication-rbac-user-management/02-RESEARCH.md (Pattern 5: Axios interceptor)
  </read_first>
  <action>
1. Create frontend/src/features/auth/types.ts:
   ```typescript
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
   ```

2. Create frontend/src/lib/auth.ts:
   ```typescript
   // Token storage helpers.
   // Access token: memory only (React Context state) — never persisted to localStorage.
   // Refresh token: localStorage — acceptable threat model for CHO 2 internal deployment.

   const REFRESH_TOKEN_KEY = "link_refresh_token";

   export function getRefreshToken(): string | null {
     return localStorage.getItem(REFRESH_TOKEN_KEY);
   }

   export function setRefreshToken(token: string): void {
     localStorage.setItem(REFRESH_TOKEN_KEY, token);
   }

   export function clearTokens(): void {
     localStorage.removeItem(REFRESH_TOKEN_KEY);
   }
   ```

3. Create frontend/src/lib/axios.ts:
   ```typescript
   import axios from "axios";
   import { clearTokens, getRefreshToken, setRefreshToken } from "./auth";

   const api = axios.create({
     baseURL: "/api",
     headers: { "Content-Type": "application/json" },
   });

   // In-memory access token — never stored in localStorage (XSS protection)
   let accessToken: string | null = null;

   export function setAccessToken(token: string): void {
     accessToken = token;
   }

   export function getAccessToken(): string | null {
     return accessToken;
   }

   // Attach access token to every request
   api.interceptors.request.use((config) => {
     if (accessToken) {
       config.headers["Authorization"] = `Bearer ${accessToken}`;
     }
     return config;
   });

   // 401 interceptor: attempt token refresh, retry original request
   // Uses shared promise queue to prevent race conditions on concurrent 401s
   let isRefreshing = false;
   let failedQueue: Array<{
     resolve: (token: string) => void;
     reject: (err: unknown) => void;
   }> = [];

   const processQueue = (error: unknown, token: string | null = null) => {
     failedQueue.forEach((prom) =>
       error ? prom.reject(error) : prom.resolve(token!)
     );
     failedQueue = [];
   };

   api.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config;
       if (error.response?.status === 401 && !originalRequest._retry) {
         if (isRefreshing) {
           return new Promise((resolve, reject) => {
             failedQueue.push({ resolve, reject });
           }).then((token) => {
             originalRequest.headers["Authorization"] = `Bearer ${token}`;
             return api(originalRequest);
           });
         }
         originalRequest._retry = true;
         isRefreshing = true;
         try {
           const refreshToken = getRefreshToken();
           if (!refreshToken) throw new Error("No refresh token");
           const { data } = await api.post("/auth/refresh", {
             refresh_token: refreshToken,
           });
           setAccessToken(data.access_token);
           setRefreshToken(data.refresh_token);
           processQueue(null, data.access_token);
           originalRequest.headers["Authorization"] = `Bearer ${data.access_token}`;
           return api(originalRequest);
         } catch (refreshError) {
           processQueue(refreshError, null);
           clearTokens();
           accessToken = null;
           window.location.href = "/login";
           return Promise.reject(refreshError);
         } finally {
           isRefreshing = false;
         }
       }
       return Promise.reject(error);
     }
   );

   export default api;
   ```

4. Create frontend/src/features/auth/api.ts:
   ```typescript
   import api from "@/lib/axios";
   import { setAccessToken } from "@/lib/axios";
   import { setRefreshToken, clearTokens } from "@/lib/auth";
   import type { LoginRequest, TokenResponse, UserSchema } from "./types";
   import { jwtDecode } from "jwt-decode";

   export async function loginApi(body: LoginRequest): Promise<UserSchema> {
     const { data } = await api.post<TokenResponse>("/auth/login", body);
     setAccessToken(data.access_token);
     setRefreshToken(data.refresh_token);
     // Decode user info from access token payload (no DB round-trip needed)
     const payload = jwtDecode<{
       sub: string;
       roles: string[];
       health_station_id: number | null;
     }>(data.access_token);
     return {
       id: parseInt(payload.sub, 10),
       email: body.email,
       full_name: "",  // not in JWT payload; will be populated from /admin/users if needed
       roles: payload.roles,
       health_station_id: payload.health_station_id,
       is_active: true,
     };
   }

   export async function logoutApi(refreshToken: string): Promise<void> {
     await api.post("/auth/logout", { refresh_token: refreshToken });
     clearTokens();
   }
   ```
  </action>
  <verify>
    <automated>cd /d/capstone-hsms/frontend && npm run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - frontend/src/features/auth/types.ts contains "interface UserSchema"
    - frontend/src/features/auth/types.ts contains "interface LoginRequest"
    - frontend/src/lib/auth.ts contains "getRefreshToken"
    - frontend/src/lib/auth.ts does NOT contain "access_token" (access token is never in localStorage)
    - frontend/src/lib/axios.ts contains "isRefreshing"
    - frontend/src/lib/axios.ts contains "/auth/refresh"
    - frontend/src/lib/axios.ts contains "processQueue"
    - frontend/src/features/auth/api.ts contains "loginApi"
    - frontend/src/features/auth/api.ts contains "jwtDecode"
    - cd /d/capstone-hsms/frontend && npm run typecheck exits 0
  </acceptance_criteria>
  <done>Auth types, token storage, Axios client with 401 interceptor, and auth API module created; TypeScript clean.</done>
</task>

<task type="auto">
  <name>Task 2: AuthContext, useAuth hook, ProtectedRoute, App router skeleton, wrap main.tsx</name>
  <read_first>
    - frontend/src/main.tsx (current content after Plan 02-05 — must add AuthProvider wrap)
    - frontend/src/App.tsx (current content — replace with router skeleton)
    - frontend/src/features/auth/types.ts (UserSchema, LoginRequest types)
    - .planning/phases/02-authentication-rbac-user-management/02-RESEARCH.md (Pattern 6: ProtectedRoute)
  </read_first>
  <action>
1. Create frontend/src/contexts/AuthContext.tsx:
   ```typescript
   import {
     createContext,
     useCallback,
     useEffect,
     useState,
     type ReactNode,
   } from "react";
   import { loginApi, logoutApi } from "@/features/auth/api";
   import { getRefreshToken, clearTokens } from "@/lib/auth";
   import { setAccessToken } from "@/lib/axios";
   import type { LoginRequest, UserSchema } from "@/features/auth/types";

   interface AuthContextValue {
     user: UserSchema | null;
     isLoading: boolean;
     login: (body: LoginRequest) => Promise<void>;
     logout: () => Promise<void>;
   }

   export const AuthContext = createContext<AuthContextValue | null>(null);

   export function AuthProvider({ children }: { children: ReactNode }) {
     const [user, setUser] = useState<UserSchema | null>(null);
     const [isLoading, setIsLoading] = useState(true);

     // On app mount: attempt silent token refresh if refresh token exists
     useEffect(() => {
       const refreshToken = getRefreshToken();
       if (!refreshToken) {
         setIsLoading(false);
         return;
       }
       // Try to restore session via refresh
       import("@/lib/axios").then(({ default: api }) => {
         api
           .post("/auth/refresh", { refresh_token: refreshToken })
           .then(({ data }) => {
             setAccessToken(data.access_token);
             import("jwt-decode").then(({ jwtDecode }) => {
               const payload = jwtDecode<{
                 sub: string;
                 roles: string[];
                 health_station_id: number | null;
               }>(data.access_token);
               setUser({
                 id: parseInt(payload.sub, 10),
                 email: "",
                 full_name: "",
                 roles: payload.roles,
                 health_station_id: payload.health_station_id,
                 is_active: true,
               });
             });
           })
           .catch(() => {
             clearTokens();
           })
           .finally(() => setIsLoading(false));
       });
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
   ```

2. Create frontend/src/hooks/useAuth.ts:
   ```typescript
   import { useContext } from "react";
   import { AuthContext } from "@/contexts/AuthContext";

   export function useAuth() {
     const ctx = useContext(AuthContext);
     if (!ctx) throw new Error("useAuth must be used within AuthProvider");
     return ctx;
   }

   export function useIsAuthorized(allowedRoles: string[]): boolean {
     const { user } = useAuth();
     if (!user) return false;
     return allowedRoles.some((r) => user.roles.includes(r));
   }
   ```

3. Create frontend/src/components/ProtectedRoute.tsx:
   ```typescript
   import { Navigate, Outlet } from "react-router-dom";
   import { useAuth } from "@/hooks/useAuth";

   interface ProtectedRouteProps {
     allowedRoles?: string[];
   }

   export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
     const { user, isLoading } = useAuth();
     if (isLoading) {
       return (
         <div className="flex items-center justify-center min-h-screen">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
         </div>
       );
     }
     if (!user) return <Navigate to="/login" replace />;
     if (allowedRoles && !allowedRoles.some((r) => user.roles.includes(r))) {
       return <Navigate to="/unauthorized" replace />;
     }
     return <Outlet />;
   }
   ```

4. Replace frontend/src/App.tsx with the router skeleton:
   ```typescript
   import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
   import { Toaster } from "@/components/ui/sonner";
   import { ProtectedRoute } from "@/components/ProtectedRoute";

   // Pages — will be created in Plans 02-06 and 02-07
   // Using lazy placeholders so the app compiles now
   const LoginPage = () => <div>Login Page — Plan 02-06</div>;
   const DashboardPage = () => <div>Dashboard — Plan 02-06</div>;
   const UsersPage = () => <div>Users Page — Plan 02-07</div>;
   const UnauthorizedPage = () => <div>Unauthorized</div>;

   export default function App() {
     return (
       <BrowserRouter>
         <Routes>
           {/* Public */}
           <Route path="/login" element={<LoginPage />} />
           <Route path="/unauthorized" element={<UnauthorizedPage />} />

           {/* Protected — all roles */}
           <Route element={<ProtectedRoute />}>
             <Route path="/dashboard" element={<DashboardPage />} />
           </Route>

           {/* Protected — system_admin only */}
           <Route element={<ProtectedRoute allowedRoles={["system_admin"]} />}>
             <Route path="/admin/users" element={<UsersPage />} />
           </Route>

           {/* Default redirect */}
           <Route path="/" element={<Navigate to="/login" replace />} />
           <Route path="*" element={<Navigate to="/login" replace />} />
         </Routes>
         <Toaster />
       </BrowserRouter>
     );
   }
   ```

5. Update frontend/src/main.tsx to wrap App in AuthProvider.
   Read the current main.tsx first (set in Plan 02-05 with font imports and globals.css). Add AuthProvider import and wrap:
   ```typescript
   import { StrictMode } from "react";
   import { createRoot } from "react-dom/client";
   import "@fontsource/ibm-plex-sans/400.css";
   import "@fontsource/ibm-plex-sans/600.css";
   import "@fontsource/ibm-plex-mono/400.css";
   import "./styles/globals.css";
   import App from "./App";
   import { AuthProvider } from "./contexts/AuthContext";

   createRoot(document.getElementById("root")!).render(
     <StrictMode>
       <AuthProvider>
         <App />
       </AuthProvider>
     </StrictMode>
   );
   ```
  </action>
  <verify>
    <automated>cd /d/capstone-hsms/frontend && npm run typecheck && npm run build</automated>
  </verify>
  <acceptance_criteria>
    - frontend/src/contexts/AuthContext.tsx contains "AuthProvider"
    - frontend/src/contexts/AuthContext.tsx contains "login"
    - frontend/src/contexts/AuthContext.tsx contains "logout"
    - frontend/src/hooks/useAuth.ts contains "useAuth"
    - frontend/src/components/ProtectedRoute.tsx contains "ProtectedRoute"
    - frontend/src/components/ProtectedRoute.tsx contains "Navigate to=\"/login\""
    - frontend/src/App.tsx contains "ProtectedRoute"
    - frontend/src/App.tsx contains "/admin/users"
    - frontend/src/main.tsx contains "AuthProvider"
    - cd /d/capstone-hsms/frontend && npm run typecheck exits 0
    - cd /d/capstone-hsms/frontend && npm run build exits 0
  </acceptance_criteria>
  <done>AuthContext, useAuth, ProtectedRoute, App router skeleton, and AuthProvider wrap all in place; TypeScript and build both pass.</done>
</task>

</tasks>

<verification>
Full auth infrastructure verification:
```bash
cd /d/capstone-hsms/frontend

# TypeScript clean
npm run typecheck

# Build succeeds
npm run build

# Key files exist
ls src/lib/axios.ts src/lib/auth.ts src/contexts/AuthContext.tsx src/hooks/useAuth.ts src/components/ProtectedRoute.tsx src/features/auth/types.ts src/features/auth/api.ts

# Axios interceptor wired
grep "isRefreshing" src/lib/axios.ts
grep "AuthProvider" src/main.tsx
```
</verification>

<success_criteria>
- npm run typecheck exits 0
- npm run build exits 0
- Axios client sends Bearer token; 401 interceptor retries with refreshed token
- AuthContext provides user, login(), logout(), isLoading
- ProtectedRoute redirects to /login when unauthenticated; to /unauthorized when wrong role
- App.tsx has router skeleton with /login, /dashboard, /admin/users routes
- main.tsx wraps App in AuthProvider
</success_criteria>

<output>
After completion, create `.planning/phases/02-authentication-rbac-user-management/02-05b-SUMMARY.md`
</output>
