import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@oja/ui";
import {
  Monitor,
  Smartphone,
  Home,
  ShoppingBag,
  Package,
  ArrowLeft,
  Pencil,
} from "lucide-react";

import type {
  StorefrontDesign,
  PageType,
  PageSpec,
} from "@/types/storefront.design";
import { PAGE_TYPE_LABELS } from "@/types/storefront.design";

import { fetchStorefrontDesign } from "@/api/storefronts/fetchStorefrontDesign";
import { fetchStorefrontProducts } from "@/api/storefronts/fetchStorefrontProducts";
import { AppLoader } from "@/components/loaders/AppLoader";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "./components/StorefrontRenderer";
import type { StorefrontProduct } from "@/types/storefront.product";

const PAGE_TABS: Array<{ type: PageType; icon: React.ReactNode }> = [
  { type: "home", icon: <Home className="h-4 w-4" /> },
  { type: "products", icon: <ShoppingBag className="h-4 w-4" /> },
  { type: "product_detail", icon: <Package className="h-4 w-4" /> },
];

const isPageType = (value: string | null): value is PageType =>
  value === "home" || value === "products" || value === "product_detail";

/**
 * Standalone, full-screen storefront preview page.
 *
 * Renders outside the dashboard layout so it is never clipped by the main
 * navigation. Can be opened via the designer ("Open in new tab") or directly.
 * Accepts `?page=home|products|product_detail` and `?product=<id>` query params
 * for deep-linking into a specific page/product.
 */
export default function StorefrontPreviewPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedPage = searchParams.get("page");
  const requestedProduct = searchParams.get("product");

  const [localPage, setLocalPage] = useState<PageType>(
    isPageType(requestedPage) ? requestedPage : "home",
  );
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    requestedProduct,
  );

  // Fetch live design + products once on mount
  const { data: design, isLoading: designLoading } = useQuery({
    queryKey: ["storefront-design", storeId!],
    queryFn: fetchStorefrontDesign,
    enabled: !!storeId,
  });

  const { data: storefrontProductsResponse, isLoading: productsLoading } =
    useQuery({
      queryKey: ["storefront-products", storeId!, 1, 100],
      queryFn: fetchStorefrontProducts,
      enabled: !!storeId,
    });

  const storefrontProducts = useMemo(
    () => storefrontProductsResponse?.data ?? [],
    [storefrontProductsResponse],
  );

  // Auto-select first product once products load
  useEffect(() => {
    if (storefrontProducts.length > 0 && !selectedProductId) {
      const firstProduct =
        storefrontProducts.find((p) => p.is_visible) || storefrontProducts[0];
      if (firstProduct) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedProductId(firstProduct.product_id);
      }
    }
  }, [storefrontProducts, selectedProductId]);

  const buildSpec = (page: PageType, design: StorefrontDesign): PageSpec => {
    const pageData = design.pages[page];
    return {
      ...pageData,
      theme: design.theme,
    };
  };

  const sampleProduct = useMemo<StorefrontProduct | undefined>(() => {
    if (!selectedProductId) return storefrontProducts[0];
    return (
      storefrontProducts.find((p) => p.product_id === selectedProductId) ||
      storefrontProducts[0]
    );
  }, [selectedProductId, storefrontProducts]);

  const isLoading = designLoading || productsLoading;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header — minimal, standalone (no dashboard chrome) */}
      <header className="bg-white border-b px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            {PAGE_TABS.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setLocalPage(tab.type)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border-b-2 transition-colors",
                  localPage === tab.type
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                ].join(" ")}
              >
                {tab.icon}
                <span className="hidden sm:inline">
                  {PAGE_TYPE_LABELS[tab.type]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
            <Button
              variant={viewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="h-7 w-7 p-0"
            >
              <Monitor className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="h-7 w-7 p-0"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </Button>
          </div>

          {storeId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/storefronts/${storeId}/designer`)}
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit in designer
            </Button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto p-8">
        {isLoading || !design ? (
          <div className="flex items-center justify-center h-full">
            <AppLoader text="Loading storefront preview..." />
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="bg-white shadow-2xl transition-all duration-300"
              style={{
                maxWidth: viewMode === "desktop" ? "100%" : "375px",
                width: "100%",
              }}
            >
              <StorefrontProvider storefrontId={storeId!} mode="preview">
                <StorefrontRenderer
                  spec={buildSpec(localPage, design)}
                  storefrontProducts={storefrontProducts}
                  currentProduct={
                    localPage === "product_detail" ? sampleProduct : undefined
                  }
                />
              </StorefrontProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
