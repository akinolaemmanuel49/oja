// hooks/useStorefrontPage.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchStorefrontBySlug } from "@/api/storefronts/fetchStorefrontBySlug";
import { fetchPublicStorefrontProducts } from "@/api/storefronts/fetchPublicStorefrontProducts";

import type { StorefrontDesign, PageSpec } from "@/types/storefront.design";
import type { StorefrontProduct } from "@/types/storefront.product";
import type { Storefront } from "@/types/storefront";

interface UseStorefrontPageOptions {
  storefrontSlug: string;
  pageType: keyof StorefrontDesign["pages"]; // 'home' | 'products' | 'product_detail'
  productId?: string; // Required for product_detail page
}

interface UseStorefrontPageResult {
  // Make these nullable/optional since they might not be loaded yet
  storefront: Storefront | null | undefined;
  products: StorefrontProduct[];
  currentProduct: StorefrontProduct | null | undefined;
  design: StorefrontDesign | null;
  pageSpec: PageSpec | null;

  // Status
  isLoading: boolean;
  error: Error | null;

  // Helpers
  isStorefrontActive: boolean;
  isPageConfigured: boolean;
  isProductFound: boolean;
  isProductVisible: boolean;
}

export function useStorefrontPage({
  storefrontSlug,
  pageType,
  productId,
}: UseStorefrontPageOptions): UseStorefrontPageResult {
  // Fetch storefront metadata and design config
  const {
    data: storefront,
    isLoading: isLoadingStorefront,
    error: storefrontError,
  } = useQuery({
    queryKey: ["storefront-by-slug", storefrontSlug],
    queryFn: fetchStorefrontBySlug,
  });

  // Fetch products once we have the storefront ID
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["public-storefront-products", storefront?.id || "", 1, 100],
    queryFn: fetchPublicStorefrontProducts,
    enabled: !!storefront?.id,
  });

  // Extract design, page spec, and product data
  const { design, pageSpec, currentProduct, allProducts } = useMemo(() => {
    if (!storefront?.design_config || !productsResponse) {
      return {
        design: null,
        pageSpec: null,
        currentProduct: null,
        allProducts: [],
      };
    }

    const design = storefront.design_config as StorefrontDesign;
    const allProducts = productsResponse.data;

    // Find specific product for detail page
    const currentProduct = productId
      ? allProducts.find((p: StorefrontProduct) => p.product_id === productId)
      : null;

    // Build full PageSpec by combining page data with shared theme
    const pageData = design.pages[pageType];
    const pageSpec: PageSpec | null = pageData
      ? {
          ...pageData,
          theme: design.theme,
        }
      : null;

    return { design, pageSpec, currentProduct, allProducts };
  }, [storefront, productsResponse, pageType, productId]);

  const products = useMemo(() => allProducts, [allProducts]);

  const isLoading = isLoadingStorefront || isLoadingProducts;
  const error = storefrontError;

  const isStorefrontActive = storefront?.status === "active";
  const isPageConfigured = !!design && !!pageSpec;

  // Product-specific checks
  const isProductFound = !productId || !!currentProduct;
  const isProductVisible = currentProduct?.is_visible ?? true;

  return {
    storefront,
    products,
    currentProduct,
    design,
    pageSpec,
    isLoading,
    error,
    isStorefrontActive,
    isPageConfigured,
    isProductFound,
    isProductVisible,
  };
}
