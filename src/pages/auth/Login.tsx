import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@oja/ui";
import { AlertCircle } from "lucide-react";
import type { ErrorResponse } from "@/responses/error";
import { login } from "@/api/auth/login";
import { AppHref } from "@/routes/constants";
import { motion } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, refreshSession } = useAuth();

  const mutation = useMutation({
    mutationFn: login,

    onSuccess: async () => {
      await refreshSession();
      window.location.reload();
    },
    onError: (err: unknown) => {
      let message = "Invalid credentials";

      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: ErrorResponse } })
          .response;
        message = response?.data?.detail ?? message;
      }

      setError(message);
    },
  });

  if (isAuthenticated) {
    navigate(AppHref.dashboardHomeRoute, { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate({ email, password });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-blue-100/60 blur-3xl animate-aurora" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-purple-100/60 blur-3xl animate-aurora" style={{ animationDelay: "4s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {searchParams.has("session_expired") && (
                <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  Your session has expired. Please sign in again.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a href="/signup" className="text-primary hover:underline">
                  Create one
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
