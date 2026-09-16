import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@oja/ui";
import type { ErrorResponse } from "@/responses/error";
import type { CreateUserRequest } from "@/requests/user";
import { AlertCircle } from "lucide-react";
import { createUserRoot } from "@/api/users/createUserRoot";
import { AppHref } from "@/routes/constants";
import { motion } from "motion/react";

export default function Signup() {
  const [form, setForm] = useState<CreateUserRequest>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createUserRoot,
    onSuccess: () => {
      navigate(AppHref.loginRoute, { replace: true });
    },
    onError: (err: unknown) => {
      let message = "Failed to create account";

      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: ErrorResponse } })
          .response;
        message = response?.data?.detail ?? message;
      }

      setError(message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
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
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl border-0 ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-2xl">Create your organization</CardTitle>
            <CardDescription>
              Set up your tenant and admin account in under a minute
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

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating account..." : "Create account"}
                </Button>
              </motion.div>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
