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
