import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Activity, HeartPulse, MapPin, ShieldCheck } from "lucide-react";

type AuthError = "wrong_credentials" | "inactive" | "server_error" | null;

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError>(null);

  // Post-login routing: watches user state set by login()
  // system_admin → /admin/users; all other roles → /dashboard
  useEffect(() => {
    if (user) {
      if (user.roles.includes("system_admin")) {
        navigate("/admin/users", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      // Navigation is handled by the useEffect above — do NOT call navigate() here.
    } catch (err: unknown) {
      const status = (err as { response?: { status: number; data?: { detail?: string } } })
        ?.response?.status;
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "";
      if (status === 401) {
        if (detail.toLowerCase().includes("inactive")) {
          setError("inactive");
        } else {
          setError("wrong_credentials");
        }
      } else {
        setError("server_error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const errorMessages: Record<NonNullable<AuthError>, string> = {
    wrong_credentials: "Incorrect email or password. Please try again.",
    inactive: "Your account is inactive. Contact the system administrator.",
    server_error: "Unable to sign in. Please try again in a moment.",
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr] login-page-enter">
      {/* ── Left brand panel ── */}
      <aside className="hidden lg:flex flex-col justify-between bg-primary p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Subtle radial glow */}
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-primary-foreground/5 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-primary-foreground/8 blur-2xl" />
          {/* Dot grid texture */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.07]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-primary-foreground" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          {/* Health pulse SVG line */}
          <svg
            viewBox="0 0 500 80"
            className="absolute bottom-40 left-0 w-full opacity-20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M0 40 L80 40 L100 40 L110 10 L130 70 L150 10 L165 55 L180 40 L260 40 L280 40 L290 15 L310 65 L325 25 L340 40 L500 40"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            />
          </svg>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm border border-primary-foreground/20">
              <HeartPulse className="size-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary-foreground">
              LINK
            </span>
          </div>
          <p className="text-sm text-primary-foreground/70 leading-relaxed pl-[52px]">
            Local Information Network for Kalusugan
          </p>
        </div>

        {/* Center: Main message */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight text-primary-foreground">
              Health data that<br />works for the field.
            </h2>
            <p className="text-base text-primary-foreground/75 leading-relaxed max-w-sm">
              Integrated health station management for 32 Barangay Health Stations
              serving Dasmariñas City.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/15">
              <div className="text-2xl font-bold text-primary-foreground">32</div>
              <div className="text-xs text-primary-foreground/65 mt-0.5">Barangay Health Stations</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/15">
              <div className="text-2xl font-bold text-primary-foreground">164K+</div>
              <div className="text-xs text-primary-foreground/65 mt-0.5">Residents Covered</div>
            </div>
          </div>
        </div>

        {/* Bottom: CHO branding */}
        <div className="relative z-10 flex items-center gap-2 text-primary-foreground/60">
          <MapPin className="size-4 shrink-0" />
          <span className="text-sm">City Health Office II · Dasmariñas City, Cavite</span>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <HeartPulse className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">LINK</span>
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the health station portal.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Error alert */}
            {error && (
              <Alert variant="destructive" id="auth-error" role="alert">
                <Activity className="size-4" />
                <AlertDescription>{errorMessages[error]}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@cho2.gov.ph"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="h-11"
                    aria-invalid={error != null}
                    aria-describedby={error ? "auth-error" : undefined}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="h-11"
                    aria-invalid={error != null}
                  />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" data-icon="inline-start" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <ShieldCheck className="size-4 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              For authorized health personnel only. Unauthorized access is prohibited under RA 10173.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
