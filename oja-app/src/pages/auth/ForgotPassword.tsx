import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, toast } from "@oja/ui";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import type { ErrorResponse } from "@/responses/error";
import { forgotPassword } from "@/api/auth/forgotPassword";
import { resetPassword } from "@/api/auth/resetPassword";
import { AppHref } from "@/routes/constants";
import { motion } from "motion/react";

type Step = "email" | "reset";

function errorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: ErrorResponse } }).response;
    return response?.data?.detail ?? fallback;
  }
  return fallback;
}

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const forgotMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("Code sent", {
        description: "Enter the code from your email to reset your password.",
      });
      setStep("reset");
    },
    onError: (err: unknown) => setError(errorMessage(err, "We couldn't send a reset code to that email.")),
  });

  const resetMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset", {
        description: "Sign in with your new password.",
      });
      navigate(AppHref.loginRoute, { replace: true });
    },
    onError: (err: unknown) => setError(errorMessage(err, "We couldn't reset your password. Check the code and try again.")),
  });

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    forgotMutation.mutate(email);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    resetMutation.mutate({ email, code: code.trim(), new_password: password });
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
            <CardTitle className="text-2xl flex items-center gap-2">
              {step === "email" ? "Reset your password" : "Enter your code"}
              {step === "reset" && <MailCheck className="h-5 w-5 text-primary" />}
            </CardTitle>
            <CardDescription>
              {step === "email"
                ? "We'll email you a one-time code to reset your password."
                : `We sent a code to ${email}. It expires in 30 minutes.`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-5">
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

                <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.01 }}>
                  <Button type="submit" className="w-full" disabled={forgotMutation.isPending}>
                    {forgotMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send reset code"
                    )}
                  </Button>
                </motion.div>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
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

                <div className="space-y-2">
                  <Label htmlFor="code">6-digit code</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-2xl tracking-[0.5em] font-semibold"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("email")}
                    disabled={resetMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={resetMutation.isPending}>
                    {resetMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Reset password"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center text-sm text-muted-foreground mt-5">
              Remembered it?{" "}
              <a href={AppHref.loginRoute} className="text-primary hover:underline">
                Back to sign in
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}