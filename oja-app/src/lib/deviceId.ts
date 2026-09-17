const KEY = "oja_device_id";
const COOKIE = "device_id";

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * The guest-cart identity for this browser/device.
 *
 * localStorage is per-origin, but cookies are per-host, so the `device_id`
 * cookie is the shared source of truth across the dashboard (localhost:5173)
 * and the public storefront (localhost:5174). Both apps converge on the same
 * id so the designer preview and the live storefront share one guest cart.
 */
export function getDeviceId(): string {
  let id = localStorage.getItem(KEY);
  const cookieId = readCookie(COOKIE);

  if (!id && cookieId) {
    id = cookieId;
    localStorage.setItem(KEY, id);
  }
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }

  try {
    document.cookie = `${COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  } catch {
    // cookies may be blocked; the header path still works
  }

  return id;
}