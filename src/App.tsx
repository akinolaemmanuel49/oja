import { useEffect, useState } from "react";
import { extractSubdomain } from "./utils/subdomain";
import StorefrontApp from "./StorefrontApp";
import LandingPage from "./pages/LandingPage";

export default function App() {
  const [slug, setSlug] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const sub = extractSubdomain(window.location.hostname);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlug(sub);
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (slug) {
    return <StorefrontApp storefrontSlug={slug} />;
  }

  // No subdomain → marketing landing
  return <LandingPage />;
}
