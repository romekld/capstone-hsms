import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

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
      // login() sets user in AuthContext; useEffect fires when user state updates.
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
    wrong_credentials: "Incorrect email or password. Try again.",
    inactive: "Your account is inactive. Contact the system administrator.",
    server_error: "Unable to sign in. Please try again in a moment.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[440px]">
        {/* LINK Wordmark */}
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">
            Sign in to LINK
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Barangay Health Station Management — CHO 2 Dasmariñas
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          {/* Error alert — above form per UI-SPEC */}
          {error && (
            <Alert variant="destructive" className="mb-6" id="auth-error" role="alert">
              <AlertDescription>{errorMessages[error]}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-11"
                aria-invalid={error != null}
                aria-describedby={error ? "auth-error" : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
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
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        {/* Footer note — no Sign Up link per project requirement (accounts are system_admin-provisioned) */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          For authorized health personnel only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
