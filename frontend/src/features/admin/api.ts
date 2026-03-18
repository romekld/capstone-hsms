import api from "@/lib/axios";
import type { AuditLogEntry, UserCreateRequest, UserListItem, UserUpdateRequest } from "./types";

export async function listUsers(): Promise<UserListItem[]> {
  const { data } = await api.get<UserListItem[]>("/admin/users");
  return data;
}

export async function createUser(body: UserCreateRequest): Promise<UserListItem> {
  const { data } = await api.post<UserListItem>("/admin/users", body);
  return data;
}

export async function getUser(userId: number): Promise<UserListItem> {
  const { data } = await api.get<UserListItem>(`/admin/users/${userId}`);
  return data;
}

export async function updateUser(userId: number, body: UserUpdateRequest): Promise<UserListItem> {
  const { data } = await api.put<UserListItem>(`/admin/users/${userId}`, body);
  return data;
}

export async function deactivateUser(userId: number): Promise<void> {
  await api.patch(`/admin/users/${userId}/deactivate`);
}

export async function reactivateUser(userId: number): Promise<void> {
  await api.patch(`/admin/users/${userId}/reactivate`);
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  // GET /api/admin/audit-logs — implemented in Plan 02-04 Task 2.
  // Returns last 100 audit_logs rows WHERE table_name='users', newest first.
  const { data } = await api.get<AuditLogEntry[]>("/admin/audit-logs");
  return data;
}
