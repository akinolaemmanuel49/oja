import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@oja/ui";
import { Loader2, MailCheck } from "lucide-react";
import { sendCode, verifyCode } from "./api";
import { useShop } from "@/hooks/useShop";

type Step = "email" | "code";

export function SignInDialog() {
  const { storefrontId, isSignInOpen, setSignInOpen, refreshCustomer, refreshCart } = useShop();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [createPlatformAccount, setCreatePlatformAccount] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setSignInOpen(false);
    setCode("");
    setError(null);
  };

  const reset = () => {
    setStep("email");
    setCode("");
    setError(null);
  };

  const handleSendCode = async () => {
    if (!storefrontId || !email || !email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendCode(storefrontId, email);
      setStep("code");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          "Could not send the code. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!storefrontId || code.length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await verifyCode({
        storefrontId,
        email,
        code,
        rememberMe,
        createPlatformAccount,
      });
      await refreshCustomer();
      await refreshCart();
      toast.success("Signed in");
      close();
      reset();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          "That code didn't work. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isSignInOpen} onOpenChange={(open) => { setSignInOpen(open); if (!open) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailCheck className="h-5 w-5" />
            {step === "email" ? "Sign in with your email" : "Enter your code"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-1">
          {step === "email" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleSendCode(); }}
                  autoFocus
                />
              </div>

              <Label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(Boolean(v))} />
                <span>Keep me signed in for 30 days</span>
              </Label>

              <Label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <Checkbox
                  checked={createPlatformAccount}
                  onCheckedChange={(v) => setCreatePlatformAccount(Boolean(v))}
                />
                <span>Also save my profile across all Oja stores (order history anywhere)</span>
              </Label>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                We emailed a one-time code to <strong>{email}</strong>. It expires in 10 minutes.
              </p>
              <div className="space-y-2">
                <Label htmlFor="signin-code">6-digit code</Label>
                <Input
                  id="signin-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleVerify(); }}
                  className="text-center text-2xl tracking-[0.5em] font-semibold"
                  autoFocus
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          {step === "code" ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button variant="outline" onClick={() => setStep("email")} disabled={sending}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => { void handleVerify(); }} disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => { void handleSendCode(); }} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send code"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}