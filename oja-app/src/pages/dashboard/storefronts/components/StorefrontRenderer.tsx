import { useState, useMemo, useCallback, createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type {
  PageSpec,
  PageComponent,
  ThemeConfig,
} from "@/types/storefront.design";
import type { StorefrontProduct } from "@/types/storefront.product";
import {
  Package,
  SlidersHorizontal,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from "lucide-react";
import { Button,Label,Select,SelectContent,SelectItem,SelectTrigger,SelectValue,Slider,toast } from "@oja/ui";
import { useStorefront } from "@/hooks/useStorefront";
import apiClient from "@/api/client";

// ============================================================================
// FILTER CONTEXT - Share filter state across components
// ============================================================================

interface FilterState {
  priceRange: [number, number];
  productType: "all" | "simple" | "variable";
  sortOrder: string;
}

interface FilterContextValue {
  filters: FilterState;
  updateFilters: (updates: Partial<FilterState>) => void;
  priceMin: number;
  priceMax: number;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
}

// ============================================================================
// PRODUCT DETAIL CONTEXT - Shared between product images & info
// ============================================================================

interface ProductDetailContextValue {
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string | null) => void;
  product: StorefrontProduct;
}

const ProductDetailContext = createContext<ProductDetailContextValue | null>(
  null,
);

function useProductDetail() {
  const context = useContext(ProductDetailContext);
  if (!context) {
    throw new Error(
      "useProductDetail must be used within ProductDetailProvider",
    );
  }
  return context;
}

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface StorefrontRendererProps {
  spec: PageSpec;
  /** Actual storefront products from API */
  storefrontProducts?: StorefrontProduct[];
  /** For product detail page - the product being viewed */
  currentProduct?: StorefrontProduct;
  /** Optional product selector for preview mode */
  productSelector?: React.ReactNode;
}

/**
 * Production renderer with live data, context-aware navigation, and dynamic filters.
 */
export function StorefrontRenderer({
  spec,
  storefrontProducts = [],
  currentProduct,
  productSelector,
}: StorefrontRendererProps) {
  const { mode } = useStorefront();

  // Calculate price range from actual products — min is always 0,
  // max is the price of the most expensive product in the store
  const { priceMin, priceMax } = useMemo(() => {
    const prices = storefrontProducts
      .filter((p) => p.is_visible)
      .map((p) => {
        if (p.product_type === "simple") return p.base_price ?? 0;
        const variantPrices = p.variants?.map((v) => v.price ?? 0) ?? [];
        return variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
      })
      .filter((price) => price > 0);

    if (prices.length === 0) return { priceMin: 0, priceMax: 100000 };

    return {
      priceMin: 0,
      priceMax: Math.max(...prices),
    };
  }, [storefrontProducts]);

  // Global filter state
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [priceMin, priceMax],
    productType: "all",
    sortOrder: "newest_first",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => {
      const [min, max] = prev.priceRange;
      return {
        ...prev,
        priceRange: [Math.max(min, priceMin), Math.min(max, priceMax)],
      };
    });
  }, [priceMin, priceMax]);

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let result = storefrontProducts.filter((p) => p.is_visible);

    // Price filter
    const [min, max] = filters.priceRange;
    result = result.filter((p) => {
      const price =
        p.product_type === "simple"
          ? (p.base_price ?? 0)
          : Math.min(...(p.variants?.map((v) => v.price ?? 0) ?? [Infinity]));
      return price >= min && price <= max;
    });

    // Type filter
    if (filters.productType !== "all") {
      result = result.filter((p) => p.product_type === filters.productType);
    }

    // Apply sorting
    switch (filters.sortOrder) {
      case "newest_first":
        result.sort((a, b) => (b.display_order ?? 0) - (a.display_order ?? 0));
        break;
      case "oldest_first":
        result.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        break;
      case "price_low_high":
        result.sort((a, b) => {
          const priceA =
            a.product_type === "simple"
              ? (a.base_price ?? 0)
              : Math.min(...(a.variants?.map((v) => v.price ?? 0) ?? [0]));
          const priceB =
            b.product_type === "simple"
              ? (b.base_price ?? 0)
              : Math.min(...(b.variants?.map((v) => v.price ?? 0) ?? [0]));
          return priceA - priceB;
        });
        break;
      case "price_high_low":
        result.sort((a, b) => {
          const priceA =
            a.product_type === "simple"
              ? (a.base_price ?? 0)
              : Math.max(...(a.variants?.map((v) => v.price ?? 0) ?? [0]));
          const priceB =
            b.product_type === "simple"
              ? (b.base_price ?? 0)
              : Math.max(...(b.variants?.map((v) => v.price ?? 0) ?? [0]));
          return priceB - priceA;
        });
        break;
      case "name_a_z":
        result.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case "name_z_a":
        result.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
    }

    return result;
  }, [storefrontProducts, filters]);

  // ========== PRODUCT DETAIL STATE ==========
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );

  // Auto-select first variant when product changes
  useEffect(() => {
    if (
      currentProduct?.product_type === "variable" &&
      currentProduct.variants?.length
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVariantId(currentProduct.variants[0].id);
    } else {
      setSelectedVariantId(null);
    }
  }, [currentProduct]);

  const productDetailValue = useMemo(
    () => ({
      selectedVariantId,
      setSelectedVariantId,
      product: currentProduct!,
    }),
    [selectedVariantId, currentProduct],
  );

  // ========== RENDER ==========
  const content = (
    <div
      style={{
        fontFamily: spec.theme.fonts.body,
        color: spec.theme.colors.text,
        backgroundColor: spec.theme.colors.background,
      }}
    >
      {/* Show product count/selector in preview mode */}
      {mode === "preview" && storefrontProducts.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          {productSelector ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
              {productSelector}
            </div>
          ) : (
            <div className="text-center">
              <span className="text-sm text-blue-900">
                Preview Mode • {storefrontProducts.length} products loaded •{" "}
                {filteredProducts.length} visible after filters
              </span>
            </div>
          )}
        </div>
      )}

      {[...spec.components]
        .sort((a, b) => a.order - b.order)
        .map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            theme={spec.theme}
            products={filteredProducts}
            currentProduct={currentProduct}
          />
        ))}
    </div>
  );

  return (
    <FilterContext.Provider
      value={{ filters, updateFilters, priceMin, priceMax }}
    >
      {currentProduct ? (
        <ProductDetailContext.Provider value={productDetailValue}>
          {content}
        </ProductDetailContext.Provider>
      ) : (
        content
      )}
    </FilterContext.Provider>
  );
}

// ============================================================================
// DISPATCHER
// ============================================================================

function ComponentRenderer({
  component,
  theme,
  products,
  currentProduct,
}: {
  component: PageComponent;
  theme: ThemeConfig;
  products: StorefrontProduct[];
  currentProduct?: StorefrontProduct;
}) {
  switch (component.type) {
    case "hero":
      return <HeroRenderer component={component} theme={theme} />;
    case "banner":
      return <BannerRenderer component={component} />;
    case "text":
      return <TextRenderer component={component} theme={theme} />;
    case "product_grid":
      return (
        <ProductGridRenderer
          component={component}
          theme={theme}
          products={products}
        />
      );
    case "product_carousel":
      return (
        <ProductCarouselRenderer
          component={component}
          theme={theme}
          products={products}
        />
      );
    case "image_gallery":
      return <ImageGalleryRenderer component={component} theme={theme} />;
    case "spacer":
      return <SpacerRenderer component={component} />;
    case "products_header":
      return (
        <ProductsHeaderRenderer
          component={component}
          theme={theme}
          productCount={products.length}
        />
      );
    case "products_filter_bar":
      return <ProductsFilterBarRenderer component={component} theme={theme} />;
    case "product_images":
      return (
        <ProductImagesRenderer
          component={component}
          theme={theme}
          product={currentProduct}
        />
      );
    case "product_info":
      return (
        <ProductInfoRenderer
          component={component}
          theme={theme}
          product={currentProduct}
        />
      );
    case "product_tabs":
      return (
        <ProductTabsRenderer component={component} product={currentProduct} />
      );
    case "related_products":
      return (
        <RelatedProductsRenderer
          component={component}
          theme={theme}
          products={products}
          currentProductId={currentProduct?.product_id}
        />
      );
    default:
      return null;
  }
}

// ============================================================================
// SHARED RENDERERS
// ============================================================================

function HeroRenderer({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "hero" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  const heightMap = {
    small: "300px",
    medium: "500px",
    large: "700px",
    full: "100vh",
  };
  const br = getBorderRadius(theme.borderRadius);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        height: heightMap[data.height],
        backgroundColor: data.backgroundColor,
        backgroundImage: data.backgroundImage
          ? `url(${data.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {data.overlay?.enabled && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: data.overlay.color,
            opacity: data.overlay.opacity / 100,
          }}
        />
      )}
      <div
        className="relative z-10 px-8 max-w-4xl mx-auto"
        style={{
          color: data.textColor,
          textAlign: data.textAlign,
          fontFamily: theme.fonts.heading,
        }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">{data.title}</h1>
        {data.subtitle && (
          <p className="text-xl md:text-2xl mb-8 opacity-90">{data.subtitle}</p>
        )}
        {data.cta?.enabled && (
          <a
            href={data.cta.url}
            className="inline-block px-8 py-4 font-medium text-lg transition-all hover:scale-105"
            style={{
              backgroundColor: theme.colors.primary,
              color: "#ffffff",
              borderRadius: br,
            }}
          >
            {data.cta.text}
          </a>
        )}
      </div>
    </div>
  );
}

function BannerRenderer({
  component,
}: {
  component: Extract<PageComponent, { type: "banner" }>;
}) {
  const { data } = component;
  const heightMap = { small: "300px", medium: "500px", large: "700px" };
  if (data.images.length === 0) {
    return (
      <div
        className="bg-gray-200 flex items-center justify-center"
        style={{ height: heightMap[data.height] }}
      >
        <p className="text-gray-500">No banner images</p>
      </div>
    );
  }
  const img = data.images[0];
  return (
    <div className="relative" style={{ height: heightMap[data.height] }}>
      {img.link ? (
        <a href={img.link}>
          <img
            src={img.url}
            alt={img.alt ?? "Banner"}
            className="w-full h-full object-cover"
          />
        </a>
      ) : (
        <img
          src={img.url}
          alt={img.alt ?? "Banner"}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

function TextRenderer({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "text" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  const maxWidthMap = {
    full: "100%",
    narrow: "640px",
    medium: "768px",
    wide: "1024px",
  };
  const paddingMap = {
    none: "0",
    small: "1rem",
    medium: "2rem",
    large: "3rem",
  };
  const br = getBorderRadius(theme.borderRadius);
  return (
    <div
      style={{
        backgroundColor: data.backgroundColor ?? "transparent",
        padding: paddingMap[data.padding],
        borderRadius: data.backgroundColor ? br : undefined,
      }}
    >
      <div
        className="mx-auto prose prose-lg"
        style={{
          maxWidth: maxWidthMap[data.maxWidth],
          textAlign: data.textAlign,
        }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}

function ImageGalleryRenderer({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "image_gallery" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  const gapMap = { small: "0.5rem", medium: "1rem", large: "2rem" };
  const br = getBorderRadius(theme.borderRadius);
  if (data.images.length === 0)
    return (
      <div className="px-4 md:px-8 py-8 text-center text-gray-500">
        <p>No gallery images</p>
      </div>
    );
  return (
    <div className="px-4 md:px-8 py-8">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${data.columns}, 1fr)`,
          gap: gapMap[data.gap],
        }}
      >
        {data.images.map((img, i) => (
          <div key={i} className="overflow-hidden" style={{ borderRadius: br }}>
            <img
              src={img.url}
              alt={img.alt ?? `Gallery ${i + 1}`}
              className="w-full h-full object-cover hover:scale-110 transition-transform"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SpacerRenderer({
  component,
}: {
  component: Extract<PageComponent, { type: "spacer" }>;
}) {
  const heightMap = {
    small: "1rem",
    medium: "2rem",
    large: "4rem",
    xlarge: "6rem",
  };
  return <div style={{ height: heightMap[component.data.height] }} />;
}

// ============================================================================
// PRODUCT COMPONENTS WITH MOBILE RESPONSIVENESS
// ============================================================================

function ProductGridRenderer({
  component,
  theme,
  products,
}: {
  component: Extract<PageComponent, { type: "product_grid" }>;
  theme: ThemeConfig;
  products: StorefrontProduct[];
}) {
  const { data } = component;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = data.limit;

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const spacing = {
    compact: "gap-3 md:gap-4",
    normal: "gap-4 md:gap-6",
    relaxed: "gap-6 md:gap-8",
  }[data.spacing];
  const br = getBorderRadius(theme.borderRadius);

  // Responsive column classes
  const getColumnClass = (columns: number) => {
    // Mobile: 1 column, Tablet: 2-3 columns, Desktop: configured columns
    if (columns <= 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    if (columns === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (columns === 5) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6";
  };

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 w-full max-w-7xl mx-auto">
      {data.title && (
        <h2
          className="text-xl md:text-3xl font-bold mb-4 md:mb-8"
          style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
        >
          {data.title}
        </h2>
      )}

      {paginatedProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-3 md:mb-4 text-gray-300" />
          <p className="text-sm md:text-base">
            No products match the current filters
          </p>
        </div>
      ) : (
        <>
          <div className={`grid ${spacing} ${getColumnClass(data.columns)}`}>
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                showPrice={data.showPrice}
                showSku={data.showSku}
                cardStyle={data.cardStyle}
                theme={theme}
                borderRadius={br}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs md:text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="text-center mt-4 md:mt-6 text-xs md:text-sm text-gray-500">
            Showing {paginatedProducts.length} of {products.length} products
          </div>
        </>
      )}
    </div>
  );
}

function ProductCarouselRenderer({
  component,
  theme,
  products,
}: {
  component: Extract<PageComponent, { type: "product_carousel" }>;
  theme: ThemeConfig;
  products: StorefrontProduct[];
}) {
  const { data } = component;
  const br = getBorderRadius(theme.borderRadius);
  const visibleProducts = products.slice(0, data.limit);

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 w-full max-w-7xl mx-auto">
      {data.title && (
        <h2
          className="text-xl md:text-3xl font-bold mb-4 md:mb-8"
          style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
        >
          {data.title}
        </h2>
      )}

      <div className="flex gap-3 md:gap-5 overflow-x-auto pb-4 md:pb-6 snap-x snap-mandatory">
        {visibleProducts.map((product) => (
          <div
            key={product.product_id}
            className="shrink-0 w-[70%] sm:w-[45%] md:w-[32%] lg:w-[24%] snap-start"
          >
            <ProductCard
              product={product}
              showPrice={data.showPrice}
              showSku={data.showSku}
              cardStyle="shadow"
              theme={theme}
              borderRadius={br}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedProductsRenderer({
  component,
  theme,
  products,
  currentProductId,
}: {
  component: Extract<PageComponent, { type: "related_products" }>;
  theme: ThemeConfig;
  products: StorefrontProduct[];
  currentProductId?: string;
}) {
  const { data } = component;
  const br = getBorderRadius(theme.borderRadius);
  const visibleProducts = products
    .filter((p) => p.product_id !== currentProductId)
    .slice(0, data.limit);

  // Responsive columns
  const getColumnClass = (columns: number) => {
    if (columns <= 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 border-t w-full max-w-7xl mx-auto">
      <h2
        className="text-xl md:text-3xl font-bold mb-4 md:mb-8"
        style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
      >
        {data.title}
      </h2>

      <div className={`grid gap-4 md:gap-6 ${getColumnClass(data.columns)}`}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            showPrice={true}
            showSku={false}
            cardStyle={data.cardStyle}
            theme={theme}
            borderRadius={br}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  showPrice,
  showSku,
  cardStyle,
  theme,
  borderRadius,
}: {
  product: StorefrontProduct;
  showPrice: boolean;
  showSku: boolean;
  cardStyle: "minimal" | "bordered" | "shadow";
  theme: ThemeConfig;
  borderRadius: string;
}) {
  const navigate = useNavigate();
  const { mode, getProductPath } = useStorefront();

  const hasVariants =
    product.product_type === "variable" &&
    product.variants &&
    product.variants.length > 0;
  const firstVariant = hasVariants ? product.variants![0] : null;

  const displayPrice = hasVariants ? firstVariant?.price : product.base_price;
  const displayImageUrl = hasVariants
    ? firstVariant?.main_image_url
    : product.main_image_url;

  const handleClick = () => {
    if (mode === "preview") {
      return;
    }
    navigate(getProductPath(product.product_id));
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group block overflow-hidden transition-all duration-200 bg-white",
        mode === "storefront" && "cursor-pointer hover:-translate-y-1",
        mode === "preview" && "cursor-default",
        cardStyle === "bordered" && "border border-gray-200",
        cardStyle === "shadow" && "shadow-md hover:shadow-xl",
      )}
      style={{ borderRadius }}
    >
      <div className="aspect-square relative bg-gray-50 overflow-hidden">
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 md:h-16 w-12 md:w-16 text-gray-300" />
          </div>
        )}
      </div>

      <div className="p-2 md:p-4">
        <h3
          className="font-medium text-sm md:text-base lg:text-lg mb-1 md:mb-1.5 line-clamp-2"
          style={{
            color: theme.colors.text,
            minHeight: "2.5rem",
          }}
        >
          {product.product_name}
        </h3>

        {showPrice && displayPrice != null && (
          <p
            className="font-bold text-base md:text-lg lg:text-xl"
            style={{ color: theme.colors.primary }}
          >
            ₦{displayPrice.toLocaleString()}
          </p>
        )}

        {showSku && (product.sku || firstVariant?.sku) && (
          <p className="text-xs text-gray-500 mt-1 hidden sm:block">
            SKU: {product.sku || firstVariant?.sku}
          </p>
        )}

        {hasVariants && (
          <p className="text-xs text-gray-500 mt-1 italic">
            {product.variants!.length} variant
            {product.variants!.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCTS PAGE WITH MOBILE-RESPONSIVE FILTERS
// ============================================================================

function ProductsHeaderRenderer({
  component,
  theme,
  productCount,
}: {
  component: Extract<PageComponent, { type: "products_header" }>;
  theme: ThemeConfig;
  productCount: number;
}) {
  const { data } = component;
  const { filters, updateFilters } = useFilters();

  return (
    <div className="px-4 md:px-8 py-4 md:py-6 w-full max-w-7xl mx-auto">
      <h1
        className="text-2xl md:text-4xl font-bold mb-1"
        style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
      >
        {data.title}
      </h1>
      {data.subtitle && (
        <p className="text-sm md:text-lg text-gray-500 mb-3 md:mb-4">
          {data.subtitle}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 md:mt-4">
        {data.showResultCount && (
          <span className="text-xs md:text-sm text-gray-500">
            Showing {productCount} product{productCount !== 1 ? "s" : ""}
          </span>
        )}
        {data.showSortDropdown && (
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => updateFilters({ sortOrder: value })}
          >
            <SelectTrigger className="w-full sm:w-50">
              <span className="flex items-center gap-2 min-w-0">
                <SlidersHorizontal className="h-3 md:h-4 w-3 md:w-4 shrink-0" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="newest_first">Newest First</SelectItem>
              <SelectItem value="oldest_first">Oldest First</SelectItem>
              <SelectItem value="price_low_high">Price: Low to High</SelectItem>
              <SelectItem value="price_high_low">Price: High to Low</SelectItem>
              <SelectItem value="name_a_z">Name: A-Z</SelectItem>
              <SelectItem value="name_z_a">Name: Z-A</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

function ProductsFilterBarRenderer({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "products_filter_bar" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  const { filters, updateFilters, priceMin, priceMax } = useFilters();

  return (
    <div
      className={`w-full border-y bg-gray-50 ${
        data.sticky ? "sticky top-0 z-10" : ""
      }`}
    >
      <div
        className={`px-4 md:px-8 py-3 md:py-4 w-full max-w-7xl mx-auto flex ${
          data.filterPosition === "side"
            ? "flex-col gap-3 md:gap-4"
            : "flex-col sm:flex-row flex-wrap gap-3 md:gap-4 items-start"
        }`}
      >
      <span className="text-xs md:text-sm font-medium text-gray-700">
        Filters:
      </span>

      {data.showPriceFilter && (
        <div className="flex-1 min-w-50 w-full sm:w-auto">
          <Label className="text-xs font-medium mb-2 block">Price Range</Label>
          <div className="space-y-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) =>
                updateFilters({ priceRange: value as [number, number] })
              }
              min={priceMin}
              max={priceMax}
              step={500}
              minStepsBetweenThumbs={1}
              className="w-full **:[[role=slider]]:bg-blue-500 **:[[role=slider]]:border-2 **:[[role=slider]]:border-white **:[[role=slider]]:shadow-md"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>₦{filters.priceRange[0].toLocaleString()}</span>
              <span>₦{filters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {data.showTypeFilter && (
        <div className="min-w-37.5 w-full sm:w-auto">
          <Label className="text-xs font-medium mb-2 block">Product Type</Label>
          <Select
            value={filters.productType}
            onValueChange={(value) =>
              updateFilters({
                productType: value as "all" | "simple" | "variable",
              })
            }
          >
            <SelectTrigger
              className="w-full bg-white"
              style={{ borderRadius: getBorderRadius(theme.borderRadius) }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="variable">Variable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCT DETAIL RENDERERS WITH VARIANT IMAGE SWITCHING
// ============================================================================

export function ProductImagesRenderer({
  component,
  theme,
  product,
}: {
  component: Extract<PageComponent, { type: "product_images" }>;
  theme: ThemeConfig;
  product?: StorefrontProduct;
}) {
  const { data } = component;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const { selectedVariantId } = useProductDetail();

  const images = useMemo(() => {
    if (!product) return [];

    if (product.product_type === "simple") {
      return product.main_image_url ? [product.main_image_url] : [];
    }

    const variantToUse = selectedVariantId
      ? product.variants?.find((v) => v.id === selectedVariantId)
      : product.variants?.[0];

    return variantToUse?.image_urls || [];
  }, [product, selectedVariantId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedImageIndex(0);
  }, [selectedVariantId]);

  const count = images.length;
  const goTo = useCallback((index: number) => {
    const n = images.length;
    if (n === 0) return;
    setSelectedImageIndex(((index % n) + n) % n);
  }, [images.length]);

  const prev = useCallback(() => {
    goTo(selectedImageIndex - 1);
  }, [goTo, selectedImageIndex]);

  const next = useCallback(() => {
    goTo(selectedImageIndex + 1);
  }, [goTo, selectedImageIndex]);

  const openLightbox = useCallback(() => {
    setLightboxIdx(selectedImageIndex);
    setLightboxOpen(true);
  }, [selectedImageIndex]);

  const aspectMap = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-video",
  };

  const br = getBorderRadius(theme.borderRadius);
  const showThumbs = data.showThumbnails && count > 1;
  const zoomOnClick = data.zoomOnClick !== "none";
  const zoomAction =
    data.zoomOnClick === "double-click" ? "onDoubleClick" : "onClick";

  // Keyboard navigation on the gallery (left/right arrows, Escape to close lightbox)
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    },
    [prev, next],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, prev, next]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen]);

  if (count === 0) {
    return (
      <div className="px-4 md:px-8 py-8">
        <div
          className={cn(
            "bg-gray-200 flex items-center justify-center w-full max-w-3xl mx-auto max-h-[70vh] overflow-hidden",
            aspectMap[data.mainImageAspect],
          )}
          style={{ borderRadius: br }}
        >
          <Package className="h-16 md:h-24 w-16 md:w-24 text-gray-400" />
        </div>
      </div>
    );
  }

  const thumbClass = (index: number) =>
    cn(
      "cursor-pointer border-2 overflow-hidden transition-all duration-150",
      "aspect-square",
      selectedImageIndex === index
        ? "border-blue-500 opacity-100"
        : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-300",
    );

  const thumbs =
    data.thumbnailPosition === "left" ? (
      <div className="flex flex-col gap-2 w-16 md:w-20 shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View image ${i + 1}`}
            onClick={() => setSelectedImageIndex(i)}
            className={thumbClass(i)}
            style={{ borderRadius: br }}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    ) : (
      <div className="flex gap-2 mt-4 justify-center">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View image ${i + 1}`}
            onClick={() => setSelectedImageIndex(i)}
            className={cn(thumbClass(i), "w-16 md:w-20")}
            style={{ borderRadius: br }}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    );

  const navArrow = (dir: "prev" | "next") => {
    const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
    const disabled = !data.showNavigation || count <= 1;
    const handler = dir === "prev" ? prev : next;
    return (
      <button
        type="button"
        aria-label={dir === "prev" ? "Previous image" : "Next image"}
        disabled={disabled}
        onClick={handler}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full",
          "bg-white/80 hover:bg-white text-gray-700 shadow-sm transition",
          "disabled:opacity-0 disabled:pointer-events-none",
          dir === "prev" ? "left-2 md:left-3" : "right-2 md:right-3",
        )}
      >
        <Icon className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    );
  };

  return (
    <div
      className={cn(
        "px-4 md:px-8 py-6 md:py-8 w-full max-w-3xl mx-auto flex gap-4",
        showThumbs && data.thumbnailPosition === "left"
          ? "flex-col sm:flex-row"
          : "flex-col",
      )}
      onKeyDown={onKeyDown}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      {showThumbs && data.thumbnailPosition === "left" && thumbs}

      {/* Main image */}
      <div
        className={cn("flex-1 overflow-hidden relative", data.zoomOnHover ? "group" : "")}
        style={{ borderRadius: br, maxHeight: "min(520px, 70vh)" }}
      >
        <div className={cn(aspectMap[data.mainImageAspect], "h-full w-full bg-gray-50")}>
          <img
            key={selectedImageIndex}
            src={images[selectedImageIndex]}
            alt={product?.product_name}
            className={cn(
              "w-full h-full object-contain transition-transform duration-300",
              data.zoomOnHover && "group-hover:scale-110",
              "[animation:fadeSlideIn_0.25s_ease]",
            )}
            {...(zoomOnClick && zoomAction === "onDoubleClick"
              ? { onDoubleClick: openLightbox }
              : zoomOnClick
                ? { onClick: openLightbox }
                : {})}
          />
        </div>

        {/* Image counter */}
        {data.showCounter && count > 1 && (
          <span className="absolute bottom-2 right-2 text-xs font-medium bg-black/60 text-white px-2 py-0.5 rounded-full">
            {selectedImageIndex + 1} / {count}
          </span>
        )}

        {/* Zoom hint */}
        {zoomOnClick && (
          <button
            type="button"
            aria-label="Zoom image"
            onClick={openLightbox}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm transition"
          >
            <ZoomIn className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        )}

        {/* Prev / next arrows */}
        {navArrow("prev")}
        {navArrow("next")}
      </div>

      {showThumbs && data.thumbnailPosition === "bottom" && thumbs}

      {/* Lightbox / zoom overlay */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center">
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <X className="h-7 w-7" />
          </button>

          <div className="flex items-center gap-4 w-full max-w-5xl px-4">
            <button
              type="button"
              aria-label="Previous image"
              disabled={count <= 1}
              onClick={prev}
              className="text-white hover:text-gray-300 transition disabled:opacity-30"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            <div className="flex-1 flex items-center justify-center">
              <img
                key={lightboxIdx}
                src={images[lightboxIdx]}
                alt={product?.product_name}
                className="max-h-[85vh] max-w-full object-contain [animation:fadeIn_0.2s_ease]"
              />
            </div>

            <button
              type="button"
              aria-label="Next image"
              disabled={count <= 1}
              onClick={next}
              className="text-white hover:text-gray-300 transition disabled:opacity-30"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </div>

          {data.showCounter && count > 1 && (
            <span className="mt-4 text-sm text-gray-300">
              {lightboxIdx + 1} / {count}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ProductInfoRenderer({
  component,
  theme,
  product,
}: {
  component: Extract<PageComponent, { type: "product_info" }>;
  theme: ThemeConfig;
  product?: StorefrontProduct;
}) {
  const { data } = component;
  const [quantity, setQuantity] = useState(1);

  // Use the shared product detail context
  const { selectedVariantId, setSelectedVariantId } = useProductDetail();
  const { storefrontId } = useStorefront();

  const br = getBorderRadius(theme.borderRadius);

  const handleAddToCart = async () => {
    if (!product) return;
    if (isVariable && (!selectedVariantId || !currentVariant)) {
      toast.error("Please select a product variant first");
      return;
    }
    try {
      await apiClient.post(
        "/carts/items",
        {
          product_id: product.product_id,
          variant_id: isVariable ? selectedVariantId : null,
          quantity,
        },
        { params: { storefront_id: storefrontId } },
      );
      toast.success("Added to cart");
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ??
        "Could not add to cart";
      toast.error(String(detail));
    }
  };

  if (!product) {
    return (
      <div className="px-4 md:px-8 py-8">
        <div className="p-8 bg-gray-100 rounded text-center text-gray-500">
          No product data available
        </div>
      </div>
    );
  }

  const isVariable = product.product_type === "variable";
  const currentVariant =
    isVariable && selectedVariantId
      ? product.variants?.find((v) => v.id === selectedVariantId)
      : null;

  const displayPrice = isVariable ? currentVariant?.price : product.base_price;
  const displaySku = isVariable ? currentVariant?.sku : product.sku;
  const inStock = isVariable ? (currentVariant?.stock_quantity ?? 0) > 0 : true;

  const variantAttributes =
    isVariable && product.variants
      ? Object.keys(product.variants[0]?.attributes || {})
      : [];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 space-y-3 md:space-y-4">
      <div>
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}
        >
          {product.product_name}
        </h1>
        {data.showSku && displaySku && (
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            SKU: {displaySku}
          </p>
        )}
        {data.pricePosition === "below_name" && displayPrice != null && (
          <p
            className="text-xl md:text-2xl font-bold mt-2"
            style={{ color: theme.colors.primary }}
          >
            ₦{displayPrice.toLocaleString()}
          </p>
        )}
      </div>

      {data.showStockStatus && (
        <span
          className={cn(
            "inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium",
            inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
          )}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      )}

      {data.showVariantSelector &&
        isVariable &&
        product.variants &&
        variantAttributes.length > 0 && (
          <div className="space-y-3">
            {variantAttributes.map((attrName) => {
              const uniqueValues = Array.from(
                new Set(product.variants!.map((v) => v.attributes[attrName])),
              );

              return (
                <div key={attrName}>
                  <p className="text-xs md:text-sm font-medium mb-2">
                    {attrName}
                  </p>
                  {data.variantSelectorStyle === "buttons" ? (
                    <div className="flex gap-2 flex-wrap">
                      {uniqueValues.map((value) => {
                        const variant = product.variants!.find(
                          (v) =>
                            v.attributes[attrName] === value &&
                            (!selectedVariantId ||
                              v.id === selectedVariantId ||
                              Object.keys(v.attributes).every(
                                (k) =>
                                  k === attrName ||
                                  v.attributes[k] ===
                                    currentVariant?.attributes[k],
                              )),
                        );

                        const isSelected = variant?.id === selectedVariantId;

                        return (
                          <button
                            key={String(value)}
                            onClick={() =>
                              variant && setSelectedVariantId(variant.id)
                            }
                            className={cn(
                              "px-3 md:px-4 py-1.5 md:py-2 border-2 text-xs md:text-sm font-medium transition-colors",
                              isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 hover:border-blue-300",
                            )}
                            style={{ borderRadius: br }}
                          >
                            {String(value)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <Select
                      value={currentVariant?.attributes[attrName] as string}
                      onValueChange={(value) => {
                        const variant = product.variants!.find(
                          (v) => v.attributes[attrName] === value,
                        );
                        if (variant) setSelectedVariantId(variant.id);
                      }}
                    >
                      <SelectTrigger
                        className="w-full"
                        style={{ borderRadius: br }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {uniqueValues.map((value) => (
                          <SelectItem key={String(value)} value={String(value)}>
                            {String(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
          </div>
        )}

      {data.showQuantitySelector && (
        <div>
          <p className="text-xs md:text-sm font-medium mb-2">Quantity</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 border rounded flex items-center justify-center font-bold hover:bg-gray-50 text-sm md:text-base"
              style={{ borderRadius: br }}
            >
              −
            </button>
            <span className="w-10 md:w-12 text-center text-sm md:text-base">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 border rounded flex items-center justify-center font-bold hover:bg-gray-50 text-sm md:text-base"
              style={{ borderRadius: br }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {data.pricePosition === "above_cart" && displayPrice != null && (
        <p
          className="text-xl md:text-2xl font-bold"
          style={{ color: theme.colors.primary }}
        >
          ₦{displayPrice.toLocaleString()}
        </p>
      )}

      <button
        disabled={!inStock}
        onClick={() => void handleAddToCart()}
        className="w-full py-3 md:py-4 font-semibold text-white flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: theme.colors.primary, borderRadius: br }}
      >
        <ShoppingCart className="h-4 md:h-5 w-4 md:w-5" />
        {data.addToCartButtonText}
      </button>
    </div>
  );
}

function ProductTabsRenderer({
  component,
  product,
}: {
  component: Extract<PageComponent, { type: "product_tabs" }>;
  product?: StorefrontProduct;
}) {
  const { data } = component;
  const [activeTabId, setActiveTabId] = useState(data.defaultTab);

  // Process tabs to inject product description where needed
  const processedTabs = useMemo(() => {
    if (!product?.product_description) return data.tabs;

    return data.tabs.map((tab) => {
      if (tab.label.toLowerCase().includes("description")) {
        return {
          ...tab,
          content: `<p>${product.product_description}</p>`,
        };
      }
      return tab;
    });
  }, [data.tabs, product]);

  const enabledTabs = useMemo(
    () => processedTabs.filter((t) => t.enabled),
    [processedTabs],
  );

  const activeTab = useMemo(
    () => enabledTabs.find((t) => t.id === activeTabId) ?? enabledTabs[0],
    [enabledTabs, activeTabId],
  );

  const tabBtnClass = (isActive: boolean) => {
    const base =
      "px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-colors cursor-pointer ";
    if (data.tabStyle === "underline")
      return (
        base +
        `border-b-2 ${isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`
      );
    if (data.tabStyle === "pills")
      return (
        base +
        `rounded-full ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`
      );
    return (
      base +
      `border ${isActive ? "bg-white border-b-white -mb-px z-10 relative" : "bg-gray-50 text-gray-500"}`
    );
  };

  if (enabledTabs.length === 0) {
    return null;
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8">
      <div
        className={`flex overflow-x-auto ${data.tabStyle === "pills" ? "gap-2 p-1 bg-gray-100 rounded-full w-fit" : "border-b"}`}
      >
        {enabledTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={tabBtnClass(tab.id === activeTab?.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab && (
        <div
          className={`${data.tabStyle === "boxed" ? "border border-t-0 rounded-b p-4 md:p-6" : "pt-4 md:pt-6"}`}
        >
          <div
            className="prose prose-sm md:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: activeTab.content }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UTIL
// ============================================================================

function getBorderRadius(r: ThemeConfig["borderRadius"]): string {
  return { none: "0", small: "0.25rem", medium: "0.5rem", large: "1rem" }[r];
}
