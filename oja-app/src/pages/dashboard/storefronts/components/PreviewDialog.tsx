import { Dialog,DialogContent,DialogTitle,Button,Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@oja/ui";
import { Monitor, Smartphone, Home, ShoppingBag, Package, ExternalLink } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import type {
  StorefrontDesign,
  PageType,
  PageSpec,
} from "@/types/storefront.design";
import { PAGE_TYPE_LABELS } from "@/types/storefront.design";

import { fetchStorefrontProducts } from "@/api/storefronts/fetchStorefrontProducts";
import { AppLoader } from "@/components/loaders/AppLoader";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontRenderer } from "./StorefrontRenderer";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  design: StorefrontDesign;
  /** Which page tab was active in the designer when preview was opened */
  activePage: PageType;
  /** Lets the designer sync its active tab when the user switches pages inside preview */
  onPageChange: (page: PageType) => void;
}

const PAGE_TABS: Array<{ type: PageType; icon: React.ReactNode }> = [
  { type: "home", icon: <Home className="h-4 w-4" /> },
  { type: "products", icon: <ShoppingBag className="h-4 w-4" /> },
  { type: "product_detail", icon: <Package className="h-4 w-4" /> },
];

/**
 * Full-screen preview dialog showing rendered pages with live data.
 * Fetches real storefront products and passes them to the renderer.
 */
export function PreviewDialog({
  open,
  onClose,
  design,
  activePage,
  onPageChange,
}: PreviewDialogProps) {
  const [localPage, setLocalPage] = useState<PageType>(activePage);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  // Fetch real storefront products for preview
  const { data: storefrontProductsResponse, isLoading } = useQuery({
    queryKey: ["storefront-products", design.storefrontId, 1, 100],
    queryFn: fetchStorefrontProducts,
    enabled: open && !!design.storefrontId,
  });

  const storefrontProducts = useMemo(
    () => storefrontProductsResponse?.data ?? [],
    [storefrontProductsResponse],
  );

  // Auto-select first product when products load
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

  const handlePageChange = (page: PageType) => {
    setLocalPage(page);
    onPageChange(page); // keep designer tab in sync
  };

  // Build a full PageSpec for the renderer (inject shared theme)
  const buildSpec = (page: PageType): PageSpec => {
    const pageData = design.pages[page];
    return {
      ...pageData,
      theme: design.theme,
    };
  };

  // For product detail preview, use selected product
  const sampleProduct = useMemo(() => {
    if (!selectedProductId) return storefrontProducts[0];
    return (
      storefrontProducts.find((p) => p.product_id === selectedProductId) ||
      storefrontProducts[0]
    );
  }, [selectedProductId, storefrontProducts]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
          <DialogTitle className="text-base">
            Preview — {PAGE_TYPE_LABELS[localPage]}
          </DialogTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams();
                params.set("page", localPage);
                if (selectedProductId) params.set("product", selectedProductId);
                const url = `/storefronts/${design.storefrontId}/preview?${params.toString()}`;
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              title="Open preview in a new tab"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Open in new tab
            </Button>

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
          </div>
        </div>

        {/* Page switcher tabs */}
        <div className="bg-white border-b px-4 shrink-0">
          <nav className="flex gap-1">
            {PAGE_TABS.map((tab) => (
              <button
                key={tab.type}
                onClick={() => handlePageChange(tab.type)}
                className={[
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  localPage === tab.type
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                ].join(" ")}
              >
                {tab.icon}
                {PAGE_TYPE_LABELS[tab.type]}
              </button>
            ))}
          </nav>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <AppLoader text="Loading products..." />
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
                <StorefrontProvider
                  storefrontId={design.storefrontId}
                  mode="preview"
                >
                  <StorefrontRenderer
                    spec={buildSpec(localPage)}
                    storefrontProducts={storefrontProducts}
                    currentProduct={
                      localPage === "product_detail" ? sampleProduct : undefined
                    }
                    // Pass product selector for product detail page
                    productSelector={
                      localPage === "product_detail" &&
                      storefrontProducts.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-blue-900">
                            Preview Mode • {storefrontProducts.length} products
                            loaded
                          </span>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-900">
                              Viewing:
                            </span>
                            <Select
                              value={selectedProductId || ""}
                              onValueChange={setSelectedProductId}
                            >
                              <SelectTrigger className="h-8 w-64 sm:w-40 bg-white border-blue-200">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {storefrontProducts.map((product) => (
                                  <SelectItem
                                    key={product.product_id}
                                    value={product.product_id}
                                  >
                                    {product.product_name}
                                    {!product.is_visible && " (Hidden)"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : undefined
                    }
                  />
                </StorefrontProvider>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
