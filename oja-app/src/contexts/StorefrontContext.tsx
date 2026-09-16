import {
  StorefrontContext,
  type StorefrontContextValue,
} from "@/hooks/useStorefront";
import type { ReactNode } from "react";

interface StorefrontProviderProps {
  children: ReactNode;
  storefrontId: string;
  storefrontSlug?: string;
  mode: "preview" | "storefront";
}

/**
 * StorefrontProvider wraps the renderer and provides navigation context.
 *
 * Usage in Designer Preview:
 * <StorefrontProvider storefrontId="123" mode="preview">
 *   <StorefrontRenderer ... />
 * </StorefrontProvider>
 *
 * Usage in Storefront App:
 * <StorefrontProvider storefrontId="123" storefrontSlug="doomstore" mode="storefront">
 *   <StorefrontRenderer ... />
 * </StorefrontProvider>
 */
export function StorefrontProvider({
  children,
  storefrontId,
  storefrontSlug,
  mode,
}: StorefrontProviderProps) {
  const getProductPath = (productId: string): string => {
    if (mode === "preview") {
      // In preview, navigation is disabled (we can return # or handle differently)
      return "#";
    }
    // In storefront app, use clean /products/:id path
    return `/products/${productId}`;
  };

  const getProductsPath = (): string => {
    if (mode === "preview") {
      return "#";
    }
    return "/products";
  };

  const getHomePath = (): string => {
    if (mode === "preview") {
      return "#";
    }
    return "/";
  };

  const value: StorefrontContextValue = {
    storefrontId,
    storefrontSlug,
    mode,
    getProductPath,
    getProductsPath,
    getHomePath,
  };

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}
