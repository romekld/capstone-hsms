import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/layouts/AppShell";

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

        {/* Protected — all roles — wrapped in AppShell sidebar layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Protected — system_admin only — also wrapped in AppShell */}
        <Route element={<ProtectedRoute allowedRoles={["system_admin"]} />}>
          <Route element={<AppShell />}>
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
