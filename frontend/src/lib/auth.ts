// Token storage helpers.
// Access token: memory only (React Context state) — never persisted to localStorage.
// Refresh token: localStorage — acceptable threat model for CHO 2 internal deployment.
// User email: localStorage — non-sensitive display value; lets NavUser render correctly after page refresh.

const REFRESH_TOKEN_KEY = "link_refresh_token";
const USER_EMAIL_KEY = "link_user_email";

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getUserEmail(): string {
  return localStorage.getItem(USER_EMAIL_KEY) ?? "";
}

export function setUserEmail(email: string): void {
  localStorage.setItem(USER_EMAIL_KEY, email);
}

export function clearTokens(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}
