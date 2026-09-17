import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@oja/ui";
import { AlertCircle, CheckCircle2, Loader2, PackageSearch } from "lucide-react";
import { getStorefrontUrl } from "../utils/subdomain";
import { verifyOrder } from "../shop/api";

type PaymentState = "verifying" | "success" | "skipped" | "error";

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const reference = params.get("reference") ?? "";
  const status = params.get("status") ?? "";
  const storefrontSlug = params.get("storefront_slug") ?? "";

  // Payments are made inside a specific store, so the callback should return
  // the shopper there (via the subdomain URL) rather than the bare host.
  const returnUrl = storefrontSlug
    ? getStorefrontUrl(storefrontSlug, "/")
    : "/";

  const [state, setState] = useState<PaymentState>("verifying");

  useEffect(() => {
    let active = true;

    (async () => {
      if (status === "cancelled") {
        if (active) setState("skipped");
        return;
      }
      if (!reference) {
        if (active) setState("error");
        return;
      }
      try {
        await verifyOrder(reference);
        if (active) setState("success");
      } catch {
        if (active) setState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [reference, status]);

  // After confirming, take the shopper back to their store's home page.
  useEffect(() => {
    if (state !== "success") return;
    const timer = setTimeout(() => {
      window.location.href = returnUrl;
    }, 2500);
    return () => clearTimeout(timer);
  }, [state, returnUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        {state === "verifying" && (
          <>
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600 mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Verifying payment…
            </h1>
            <p className="text-sm text-gray-500">
              Please wait, we're confirming your order.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Payment confirmed
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your order has been placed. A receipt has been sent to your email.
              Taking you back to the store…
            </p>
            <a href={returnUrl} className="block">
              <Button className="w-full">Back to store</Button>
            </a>
          </>
        )}

        {state === "skipped" && (
          <>
            <PackageSearch className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Payment cancelled
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your order was not completed. You can try again from your cart.
            </p>
            <a href={returnUrl} className="block">
              <Button variant="outline" className="w-full">
                Back to store
              </Button>
            </a>
          </>
        )}

        {state === "error" && (
          <>
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              We couldn't verify your payment. Check your email for a receipt, or
              contact the store's support team.
            </p>
            <a href={returnUrl} className="block">
              <Button variant="outline" className="w-full">
                Back to store
              </Button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}