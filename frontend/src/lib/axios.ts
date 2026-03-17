import axios, { type InternalAxiosRequestConfig } from "axios";
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

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as {
      config?: RetryableConfig;
      response?: { status: number };
    };
    const originalRequest = axiosError.config;
    if (
      axiosError.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login"
    ) {
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
        const { data } = await api.post<{
          access_token: string;
          refresh_token: string;
        }>("/auth/refresh", {
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
