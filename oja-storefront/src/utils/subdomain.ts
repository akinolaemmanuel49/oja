/**
 * Subdomain Extraction Utility
 *
 * Extracts the storefront slug from the hostname for multi-tenant routing.
 *
 * Examples:
 * - galaxy.localhost:3000 → "galaxy"
 * - mystore.example.com → "mystore"
 * - localhost:3000 → null (no subdomain)
 * - example.com → null (no subdomain)
 */

/**
 * Extract subdomain (storefront slug) from hostname
 *
 * @param hostname - The hostname to parse (e.g., window.location.hostname)
 * @returns The subdomain/slug or null if not found
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present (e.g., "galaxy.localhost:3000" → "galaxy.localhost")
  const hostWithoutPort = hostname.split(":")[0];

  // Split by dots
  const parts = hostWithoutPort.split(".");

  // If hostname is just "localhost" or has only 1 part, no subdomain
  if (parts.length < 2) {
    return null;
  }

  // Special handling for localhost (galaxy.localhost → "galaxy")
  if (parts[parts.length - 1] === "localhost") {
    // If it's just "localhost", no subdomain
    if (parts.length === 1) {
      return null;
    }
    // Return the first part as subdomain
    return parts[0];
  }

  // For regular domains (mystore.example.com → "mystore")
  // Assumes the subdomain is the first part
  // If you have multi-level domains like mystore.shop.example.com,
  // you'd need more sophisticated logic here
  if (parts.length >= 3) {
    return parts[0];
  }

  // For 2-part domains like "example.com", no subdomain
  return null;
}

/**
 * Check if current hostname has a valid subdomain
 */
export function hasSubdomain(hostname: string): boolean {
  return extractSubdomain(hostname) !== null;
}

/**
 * Get the full storefront URL for a given slug
 * Useful for generating links or redirects
 *
 * @param slug - The storefront slug
 * @param path - Optional path to append (e.g., "/products")
 */
export function getStorefrontUrl(slug: string, path: string = "/"): string {
  const { protocol, port } = window.location;

  // Determine base domain (localhost vs production domain)
  const baseDomain = window.location.hostname.includes("localhost")
    ? "localhost"
    : window.location.hostname.split(".").slice(-2).join(".");

  // Construct URL with subdomain
  const portPart = port ? `:${port}` : "";
  return `${protocol}//${slug}.${baseDomain}${portPart}${path}`;
}
