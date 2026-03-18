import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/layouts/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { CreateUserPage } from "@/pages/admin/CreateUserPage";
import { EditUserPage } from "@/pages/admin/EditUserPage";
import { PatientsPage } from "@/pages/patients/PatientsPage";
import { RegisterPatientPage } from "@/pages/patients/RegisterPatientPage";
import { PatientProfilePage } from "@/pages/patients/PatientProfilePage";
import { NewConsultationPage } from "@/pages/patients/NewConsultationPage";
import { ConsultationDetailPage } from "@/pages/patients/ConsultationDetailPage";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-5 max-w-sm">
        <div className="size-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <ShieldX className="size-7 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">Access Restricted</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You don&apos;t have permission to view this page. Contact your system administrator if you believe this is an error.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

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
            <Route path="/admin/users/new" element={<CreateUserPage />} />
            <Route path="/admin/users/:id/edit" element={<EditUserPage />} />
          </Route>
        </Route>

        {/* Protected — clinical roles — patient search and records */}
        <Route element={<ProtectedRoute allowedRoles={["nurse", "midwife", "physician", "city_health_officer", "phis_coordinator", "disease_surveillance_officer"]} />}>
          <Route element={<AppShell />}>
            <Route path="/patients" element={<PatientsPage />} />
            {/* /patients/new must be before /patients/:id — React Router first-wins */}
            <Route path="/patients/new" element={<RegisterPatientPage />} />
            <Route path="/patients/:id" element={<PatientProfilePage />} />
            <Route path="/patients/:id/consultations/new" element={<NewConsultationPage />} />
            <Route path="/patients/:id/consultations/:consultationId" element={<ConsultationDetailPage />} />
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
