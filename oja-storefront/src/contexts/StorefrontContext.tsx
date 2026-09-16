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
 * StorefrontProvider for the public storefront app
 *
 * Wraps the renderer and provides navigation context.
 * In the storefront app, mode is always "storefront" and navigation is enabled.
 */
export function StorefrontProvider({
  children,
  storefrontId,
  storefrontSlug,
  mode,
}: StorefrontProviderProps) {
  const getProductPath = (productId: string): string => {
    if (mode === "preview") {
      return "#";
    }
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
