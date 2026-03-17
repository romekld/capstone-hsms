import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, MoreHorizontal, Eye, EyeOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  createUser,
  deactivateUser,
  listAuditLogs,
  listUsers,
  reactivateUser,
  updateUser,
} from "@/features/admin/api";
import { HEALTH_STATIONS } from "@/features/admin/healthStations";
import {
  ROLE_OPTIONS,
  type AuditLogEntry,
  type UserCreateRequest,
  type UserListItem,
} from "@/features/admin/types";

// --- Create/Edit User Modal ---
interface UserModalProps {
  open: boolean;
  editTarget: UserListItem | null; // null = create mode
  onClose: () => void;
  onSuccess: () => void;
}

function UserModal({ open, editTarget, onClose, onSuccess }: UserModalProps) {
  const isEdit = !!editTarget;
  const [fullName, setFullName] = useState(editTarget?.full_name ?? "");
  const [email, setEmail] = useState(editTarget?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(editTarget?.roles ?? []);
  const [healthStationId, setHealthStationId] = useState<number | null>(
    editTarget?.health_station_id ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFullName(editTarget?.full_name ?? "");
      setEmail(editTarget?.email ?? "");
      setPassword("");
      setSelectedRoles(editTarget?.roles ?? []);
      setHealthStationId(editTarget?.health_station_id ?? null);
      setFieldError(null);
    }
  }, [open, editTarget]);

  const isSystemAdmin = selectedRoles.includes("system_admin");

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      if (role === "system_admin") {
        setSelectedRoles(["system_admin"]);
        setHealthStationId(null);
      } else {
        setSelectedRoles((prev) => prev.filter((r) => r !== "system_admin").concat(role));
      }
    } else {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
    }
  };

  const handleSubmit = async () => {
    setFieldError(null);
    setIsLoading(true);
    try {
      if (isEdit && editTarget) {
        await updateUser(editTarget.id, {
          full_name: fullName,
          roles: selectedRoles,
          health_station_id: isSystemAdmin ? null : healthStationId,
          ...(password ? { password } : {}),
        });
        toast.success("User updated successfully.");
      } else {
        const body: UserCreateRequest = {
          email,
          full_name: fullName,
          password,
          roles: selectedRoles,
          health_station_id: isSystemAdmin ? null : healthStationId,
        };
        await createUser(body);
        toast.success("User created successfully.");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status: number; data?: { detail?: string } } })
        ?.response?.status;
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "";
      if (status === 422 && detail.includes("system_admin")) {
        setFieldError("system_admin cannot be combined with other roles.");
      } else if (status === 409) {
        setFieldError("This email is already in use.");
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[540px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit User — ${editTarget?.full_name}` : "Create User"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full-name" className="text-sm font-semibold">
              Full Name
            </Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {/* Email — only editable on create */}
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              {fieldError?.includes("email") ? (
                <p className="text-xs text-destructive">{fieldError}</p>
              ) : null}
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current password" : undefined}
                required={!isEdit}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Roles</Label>
            {fieldError?.includes("system_admin") && (
              <p className="text-xs text-destructive">{fieldError}</p>
            )}
            <div className="space-y-1">
              {ROLE_OPTIONS.map(({ value, label }) => (
                <div key={value} className="flex items-center gap-3 min-h-[40px]">
                  <Checkbox
                    id={`role-${value}`}
                    checked={selectedRoles.includes(value)}
                    onCheckedChange={(checked) => handleRoleChange(value, !!checked)}
                    disabled={isSystemAdmin && value !== "system_admin"}
                    className={isSystemAdmin && value !== "system_admin" ? "opacity-50" : ""}
                  />
                  <Label
                    htmlFor={`role-${value}`}
                    className={`text-sm font-normal cursor-pointer ${
                      isSystemAdmin && value !== "system_admin" ? "opacity-50" : ""
                    }`}
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* BHS Assignment — hidden when system_admin selected */}
          {!isSystemAdmin && (
            <div className="space-y-2">
              <Label htmlFor="bhs" className="text-sm font-semibold">
                BHS Assignment
              </Label>
              <select
                id="bhs"
                value={healthStationId ?? ""}
                onChange={(e) =>
                  setHealthStationId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full h-11 border border-input rounded-md px-3 text-sm bg-background"
              >
                <option value="">— No BHS assignment —</option>
                {HEALTH_STATIONS.map((hs) => (
                  <option key={hs.id} value={hs.id}>
                    {hs.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Required for Nurse, Midwife, Physician, and BHW roles.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || !fullName || (!isEdit && !email) || selectedRoles.length === 0
            }
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Save User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Deactivation AlertDialog ---
interface DeactivateDialogProps {
  user: UserListItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

function DeactivateDialog({ user, onClose, onConfirm }: DeactivateDialogProps) {
  const roleLabels =
    user?.roles
      .map((r) => ROLE_OPTIONS.find((o) => o.value === r)?.label ?? r)
      .join(", ") ?? "";

  return (
    <AlertDialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {user?.full_name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately sign {user?.full_name} out and revoke their access. Their role:{" "}
            {roleLabels}. This action can be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep User</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Deactivate User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --- Activity Log Tab ---
function ActivityLogTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    listAuditLogs()
      .then(setLogs)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const formatTimestamp = (iso: string) =>
    new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));

  const getActionCopy = (entry: AuditLogEntry) => {
    const action = (entry.new_values?.action as string) ?? entry.operation;
    const targetName = (entry.new_values?.target_user_id as number)
      ? `user #${entry.new_values.target_user_id}`
      : "unknown user";
    switch (action) {
      case "login":
        return `Signed in`;
      case "deactivate":
        return `Deactivated ${targetName}`;
      case "reactivate":
        return `Reactivated ${targetName}`;
      default:
        return entry.operation === "CREATE"
          ? `Created account for ${targetName}`
          : `Updated account for ${targetName}`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mt-4 p-4 border border-destructive/20 bg-destructive/5 rounded-md text-sm text-destructive">
        Failed to load activity log. Refresh to try again.
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="mt-8 text-center py-12">
        <p className="text-base font-semibold text-foreground">No activity yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          User management actions will appear here once you create or edit accounts.
        </p>
      </div>
    );
  }

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(entry.performed_at)}
            </TableCell>
            <TableCell className="text-sm">{getActionCopy(entry)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- Main UsersPage ---
export function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserListItem | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserListItem | null>(null);
  const [sortKey, setSortKey] = useState<keyof UserListItem>("full_name");
  const [sortAsc, setSortAsc] = useState(true);

  const loadUsers = async () => {
    setLoadError(false);
    setIsLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSort = (key: keyof UserListItem) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = [...users].sort((a, b) => {
    const av = String(a[sortKey] ?? "");
    const bv = String(b[sortKey] ?? "");
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const getBhsName = (id: number | null) =>
    id ? HEALTH_STATIONS.find((s) => s.id === id)?.name ?? `BHS #${id}` : "\u2014";

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateUser(deactivateTarget.id);
      toast.success("User deactivated.");
      setDeactivateTarget(null);
      await loadUsers();
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  const handleReactivate = async (user: UserListItem) => {
    try {
      await reactivateUser(user.id);
      toast.success("User reactivated.");
      await loadUsers();
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  const SortIcon = ({ col }: { col: keyof UserListItem }) =>
    sortKey === col ? (
      sortAsc ? (
        <ArrowUp className="h-3 w-3 ml-1 inline" />
      ) : (
        <ArrowDown className="h-3 w-3 ml-1 inline" />
      )
    ) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="users">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">User Management</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage system_admin-provisioned accounts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              <Button
                onClick={() => {
                  setEditTarget(null);
                  setModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Create User
              </Button>
            </div>
          </div>

          <TabsContent value="users">
            {loadError && (
              <div className="mb-4 p-4 border border-destructive/20 bg-destructive/5 rounded-md text-sm text-destructive">
                Failed to load users. Refresh to try again.
              </div>
            )}

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-base font-semibold text-foreground">No users yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create the first user account to get started.
                </p>
                <Button
                  className="mt-4 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    setEditTarget(null);
                    setModalOpen(true);
                  }}
                >
                  Create User
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("full_name")}
                    >
                      Full Name <SortIcon col="full_name" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("email")}
                    >
                      Email <SortIcon col="email" />
                    </TableHead>
                    <TableHead>Role(s)</TableHead>
                    <TableHead>BHS Assignment</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("is_active")}
                    >
                      Status <SortIcon col="is_active" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("created_at")}
                    >
                      Created <SortIcon col="created_at" />
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell
                        className={`font-medium ${!user.is_active ? "text-muted-foreground" : ""}`}
                      >
                        {user.full_name}
                      </TableCell>
                      <TableCell
                        className={`text-sm ${!user.is_active ? "text-muted-foreground" : ""}`}
                      >
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.slice(0, 2).map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">
                              {ROLE_OPTIONS.find((o) => o.value === r)?.label ?? r}
                            </Badge>
                          ))}
                          {user.roles.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.roles.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{getBhsName(user.health_station_id)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs ${
                            user.is_active
                              ? "bg-[color:var(--status-safe)]/15 text-[color:var(--status-safe)] border-[color:var(--status-safe)]/30"
                              : "bg-[color:var(--status-critical)]/15 text-[color:var(--status-critical)] border-[color:var(--status-critical)]/30"
                          }`}
                          variant="outline"
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(user.created_at).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          timeZone: "Asia/Manila",
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="User actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditTarget(user);
                                setModalOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            {user.is_active ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeactivateTarget(user)}
                              >
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => void handleReactivate(user)}>
                                Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogTab />
          </TabsContent>
        </Tabs>

        <UserModal
          open={modalOpen}
          editTarget={editTarget}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(null);
          }}
          onSuccess={loadUsers}
        />

        <DeactivateDialog
          user={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => void handleDeactivate()}
        />
      </div>
    </div>
  );
}
