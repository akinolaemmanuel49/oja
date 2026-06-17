import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { ErrorResponse } from "@/responses/error";
import { login } from "@/api/auth/login";
import { AppHref } from "@/routes/constants";

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

      // Not a great solution, but it works
      window.location.reload();
      // navigate(AppHref.dashboardHomeRoute, { replace: true });
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
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

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:underline">
                Create one
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
