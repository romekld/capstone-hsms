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
