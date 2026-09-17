import { useEffect, useState } from "react";
import { extractSubdomain } from "./utils/subdomain";
import StorefrontApp from "./StorefrontApp";
import LandingPage from "./pages/LandingPage";

export default function App() {
  const [slug, setSlug] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Payment callbacks (Paystack) land on the bare host (e.g.
    // localhost:5174) with ?storefront_slug=<slug>, so we recover the store
    // context from the query string when there is no subdomain.
    let resolved = extractSubdomain(window.location.hostname);
    if (!resolved && window.location.pathname.startsWith("/payment-callback")) {
      const callbackSlug = new URLSearchParams(window.location.search).get(
        "storefront_slug",
      );
      resolved = callbackSlug || null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlug(resolved);
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (slug) {
    return <StorefrontApp storefrontSlug={slug} />;
  }

  // No subdomain → marketing landing
  return <LandingPage />;
}
