import { lazy, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
const StorefrontHomePage = lazy(() => import("./pages/StorefrontHome"));
const StorefrontProductsPage = lazy(() => import("./pages/StorefrontProducts"));
const StorefrontProductDetailPage = lazy(
  () => import("./pages/StorefrontProductDetail"),
);
const StorefrontNotFoundPage = lazy(() => import("./pages/StorefrontNotFound"));

// Utils
import { extractSubdomain } from "./utils/subdomain";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - storefronts don't change often
    },
  },
});

interface StorefrontAppProps {
  storefrontSlug: string;
}

/**
 * Main Storefront Application Component
 *
 * Handles subdomain detection for multi-tenant storefront routing.
 *
 * Expected URL patterns:
 * - galaxy.localhost:3000 → home page for "galaxy" store
 * - galaxy.localhost:3000/products → products listing for "galaxy" store
 * - galaxy.localhost:3000/products/:productId → product detail for "galaxy" store
 *
 * The subdomain (slug) is extracted once at app mount and passed down via routing.
 */
export default function StorefrontApp({ storefrontSlug }: StorefrontAppProps) {
  const [isLoadingSlug, setIsLoadingSlug] = useState(true);

  // Extract subdomain on mount
  useEffect(() => {
    const slug = extractSubdomain(window.location.hostname);

    // For development: allow localhost without subdomain for testing
    // In production, you'd redirect or show error for missing subdomain
    if (!slug) {
      console.warn(
        "No subdomain detected. Use format: yourstore.localhost:3000",
      );
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingSlug(false);
  }, []);

  // Show loading state while detecting subdomain
  if (isLoadingSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  // Show error if no subdomain found (in production, you might redirect to main site)
  if (!storefrontSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Store Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Unable to detect store from URL. Please use the format:
          </p>
          <code className="block bg-gray-100 p-4 rounded text-sm">
            yourstore.localhost:3000
          </code>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Home page */}
          <Route
            path="/"
            element={<StorefrontHomePage storefrontSlug={storefrontSlug} />}
          />

          {/* Products listing page */}
          <Route
            path="/products"
            element={<StorefrontProductsPage storefrontSlug={storefrontSlug} />}
          />

          {/* Product detail page */}
          <Route
            path="/products/:productId"
            element={
              <StorefrontProductDetailPage storefrontSlug={storefrontSlug} />
            }
          />

          {/* 404 fallback */}
          <Route
            path="/404"
            element={<StorefrontNotFoundPage storefrontSlug={storefrontSlug} />}
          />

          {/* Catch all - redirect to 404 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
