import { createContext, useContext } from "react";

/**
 * StorefrontContext provides storefront-wide state and navigation configuration.
 * This allows components to adapt behavior based on whether they're in:
 * - Designer preview mode
 * - Actual storefront app (accessed via slug/domain)
 */

export interface StorefrontContextValue {
  /** Storefront ID from database */
  storefrontId: string;
  /** Unique slug for public access (e.g., "doomstore" from "doomstore.store") */
  storefrontSlug?: string;
  /** Whether we're in preview mode (designer) or live storefront */
  mode: "preview" | "storefront";
  /** Base path for navigation - differs between preview and storefront */
  getProductPath: (productId: string) => string;
  getProductsPath: () => string;
  getHomePath: () => string;
}

export const StorefrontContext = createContext<StorefrontContextValue | null>(
  null,
);

/**
 * Hook to access storefront context
 */
export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }
  return context;
}
