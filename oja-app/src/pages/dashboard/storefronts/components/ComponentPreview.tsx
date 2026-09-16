import type { PageComponent, ThemeConfig } from "@/types/storefront.design";
import { PRODUCT_SORT_ORDER_LABELS } from "@/types/storefront.design";
import { cn } from "@/lib/utils";
import {
  Package,
  Image as ImageIcon,
  SlidersHorizontal,
  Filter,
  ShoppingCart,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ComponentPreviewProps {
  component: PageComponent;
  theme: ThemeConfig;
}

/**
 * Renders a simplified visual preview of a component inside the canvas card.
 * Not a 1:1 pixel match — just enough to communicate what the block is.
 */
export function ComponentPreview({ component, theme }: ComponentPreviewProps) {
  switch (component.type) {
    case "hero":
      return <HeroPreview component={component} theme={theme} />;
    case "banner":
      return <BannerPreview component={component} />;
    case "text":
      return <TextPreview component={component} />;
    case "product_grid":
      return <ProductGridPreview component={component} theme={theme} />;
    case "product_carousel":
      return <ProductCarouselPreview component={component} theme={theme} />;
    case "image_gallery":
      return <ImageGalleryPreview component={component} />;
    case "spacer":
      return <SpacerPreview component={component} />;
    // Products page
    case "products_header":
      return <ProductsHeaderPreview component={component} theme={theme} />;
    case "products_filter_bar":
      return <ProductsFilterBarPreview component={component} />;
    // Product detail page
    case "product_images":
      return <ProductImagesPreview component={component} />;
    case "product_info":
      return <ProductInfoPreview component={component} theme={theme} />;
    case "product_tabs":
      return <ProductTabsPreview component={component} theme={theme} />;
    case "related_products":
      return <RelatedProductsPreview component={component} theme={theme} />;
    default:
      return <div className="text-xs text-gray-400 p-2">Unknown component</div>;
  }
}

// ============================================================================
// SHARED PREVIEWS
// ============================================================================

function HeroPreview({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "hero" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  const heightMap = {
    small: "140px",
    medium: "200px",
    large: "280px",
    full: "340px",
  };

  return (
    <div
      className="relative flex items-center justify-center rounded overflow-hidden"
      style={{
        height: heightMap[data.height],
        backgroundColor: data.backgroundColor ?? theme.colors.primary,
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
        className="relative z-10 text-center px-6"
        style={{ color: data.textColor, textAlign: data.textAlign }}
      >
        <h1 className="text-3xl font-bold mb-1">{data.title}</h1>
        {data.subtitle && (
          <p className="text-sm mb-3 opacity-80">{data.subtitle}</p>
        )}
        {data.cta?.enabled && (
          <span
            className="inline-block px-4 py-1.5 rounded text-sm font-medium"
            style={{ backgroundColor: theme.colors.primary, color: "#fff" }}
          >
            {data.cta.text}
          </span>
        )}
      </div>
    </div>
  );
}

function BannerPreview({
  component,
}: {
  component: Extract<PageComponent, { type: "banner" }>;
}) {
  const { data } = component;
  const heightMap = { small: "140px", medium: "200px", large: "280px" };

  return (
    <div
      className="relative rounded overflow-hidden bg-gray-200 flex items-center justify-center"
      style={{ height: heightMap[data.height] }}
    >
      {data.images.length > 0 ? (
        <img
          src={data.images[0].url}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-center text-gray-400">
          <ImageIcon className="h-10 w-10 mx-auto mb-1" />
          <p className="text-xs">No images added</p>
        </div>
      )}
      {data.images.length > 1 && (
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          {data.images.length} slides
        </div>
      )}
    </div>
  );
}

function TextPreview({
  component,
}: {
  component: Extract<PageComponent, { type: "text" }>;
}) {
  const { data } = component;
  const paddingMap = {
    none: "0",
    small: "0.5rem",
    medium: "1rem",
    large: "1.5rem",
  };
  return (
    <div
      style={{
        backgroundColor: data.backgroundColor ?? "transparent",
        padding: paddingMap[data.padding],
      }}
      className="rounded"
    >
      <div
        className="prose prose-sm max-w-none"
        style={{ textAlign: data.textAlign }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}

function ImageGalleryPreview({
  component,
}: {
  component: Extract<PageComponent, { type: "image_gallery" }>;
}) {
  const { data } = component;
  const gapMap = { small: "0.25rem", medium: "0.5rem", large: "1rem" };
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${data.columns}, 1fr)`,
        gap: gapMap[data.gap],
      }}
    >
      {data.images.length > 0
        ? data.images.slice(0, data.columns).map((img, i) => (
            <div key={i} className="aspect-square rounded overflow-hidden">
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))
        : Array.from({ length: data.columns }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded flex items-center justify-center"
            >
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
          ))}
    </div>
  );
}

function SpacerPreview({
  component,
}: {
  component: Extract<PageComponent, { type: "spacer" }>;
}) {
  const heightMap = {
    small: "1rem",
    medium: "2rem",
    large: "3rem",
    xlarge: "4rem",
  };
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
      style={{ height: heightMap[component.data.height] }}
    >
      <span className="text-xs text-gray-400">
        Spacer — {component.data.height}
      </span>
    </div>
  );
}

function ProductGridPreview({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "product_grid" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  const previewCols = Math.min(data.columns, 4);
  return (
    <div>
      {data.title && (
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: theme.colors.text }}
        >
          {data.title}
        </h2>
      )}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${previewCols}, 1fr)` }}
      >
        {Array.from({ length: Math.min(data.limit, previewCols) }).map(
          (_, i) => (
            <div
              key={i}
              className={`rounded overflow-hidden ${data.cardStyle === "bordered" ? "border" : data.cardStyle === "shadow" ? "shadow" : ""}`}
            >
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="p-2">
                <div className="h-3 bg-gray-200 rounded mb-1" />
                {data.showPrice && (
                  <div className="h-2.5 bg-gray-100 rounded w-12" />
                )}
              </div>
            </div>
          ),
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {data.limit} products · {PRODUCT_SORT_ORDER_LABELS[data.sortOrder]}
      </p>
    </div>
  );
}

function ProductCarouselPreview({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "product_carousel" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  return (
    <div>
      {data.title && (
        <h2
          className="text-lg font-bold mb-3"
          style={{ color: theme.colors.text }}
        >
          {data.title}
        </h2>
      )}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: data.itemsPerView }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 shadow rounded overflow-hidden"
            style={{ width: `${100 / data.itemsPerView}%` }}
          >
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <div className="p-2">
              <div className="h-3 bg-gray-200 rounded mb-1" />
              {data.showPrice && (
                <div className="h-2.5 bg-gray-100 rounded w-12" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCTS PAGE PREVIEWS
// ============================================================================

function ProductsHeaderPreview({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "products_header" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
        {data.title}
      </h2>
      {data.subtitle && (
        <p className="text-sm text-gray-500 mt-1">{data.subtitle}</p>
      )}
      <div className="flex items-center justify-between mt-3">
        {data.showResultCount && (
          <span className="text-sm text-gray-500">Showing 24 products</span>
        )}
        {data.showSortDropdown && (
          <div className="flex items-center gap-2 text-sm border rounded px-3 py-1 bg-gray-50">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-600">
              {PRODUCT_SORT_ORDER_LABELS[data.defaultSortOrder]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsFilterBarPreview({
  component,
}: {
  component: Extract<PageComponent, { type: "products_filter_bar" }>;
}) {
  const { data } = component;
  return (
    <div
      className={`flex ${data.filterPosition === "side" ? "flex-col" : "flex-row"} gap-2 p-3 bg-gray-50 border rounded`}
    >
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-xs text-gray-600 font-medium">Filters</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.showPriceFilter && (
          <div className="flex items-center gap-1 border rounded px-2 py-1 bg-white text-xs text-gray-600">
            Price range
          </div>
        )}
        {data.showTypeFilter && (
          <div className="flex items-center gap-1 border rounded px-2 py-1 bg-white text-xs text-gray-600">
            Type
          </div>
        )}
      </div>
      {data.sticky && (
        <span className="text-xs text-blue-500 ml-auto">Sticky</span>
      )}
    </div>
  );
}

// ============================================================================
// PRODUCT DETAIL PAGE PREVIEWS
// ============================================================================

function ProductImagesPreview({
  component,
}: {
  component: Extract<PageComponent, { type: "product_images" }>;
}) {
  const { data } = component;
  const aspectMap = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-video",
  };

  return (
    <div className="flex gap-3">
      {/* Main image */}
      <div
        className={`relative flex-1 bg-gray-200 rounded flex items-center justify-center ${aspectMap[data.mainImageAspect]}`}
      >
        <Package className="h-12 w-12 text-gray-400" />
        {data.showNavigation && (
          <>
            <ChevronLeft className="absolute left-1.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white bg-black/40 rounded-full p-0.5" />
            <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white bg-black/40 rounded-full p-0.5" />
          </>
        )}
        {data.showCounter && (
          <span className="absolute bottom-1.5 right-1.5 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-full">
            1 / 4
          </span>
        )}
      </div>
      {/* Thumbnail strip */}
      {data.showThumbnails && (
        <div
          className={`flex ${data.thumbnailPosition === "left" ? "flex-col" : "flex-row"} gap-1.5`}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-12 h-12 bg-gray-200 rounded border-2 shadow-sm",
                i === 0 ? "border-blue-400" : "border-white",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductInfoPreview({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "product_info" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  return (
    <div className="p-4 border rounded bg-white space-y-3">
      <div>
        <h2 className="text-xl font-bold" style={{ color: theme.colors.text }}>
          Product Name
        </h2>
        {data.showSku && (
          <p className="text-xs text-gray-400 mt-0.5">SKU: PROD-001</p>
        )}
        {data.pricePosition === "below_name" && (
          <p
            className="text-lg font-bold mt-1"
            style={{ color: theme.colors.primary }}
          >
            ₦12,500
          </p>
        )}
      </div>
      {data.showStockStatus && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
          In Stock
        </span>
      )}
      {data.showVariantSelector && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Variant</p>
          <div className="flex gap-1.5">
            {["S", "M", "L"].map((v) => (
              <div
                key={v}
                className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-medium ${data.variantSelectorStyle === "buttons" ? "border-gray-300" : "border-0 bg-gray-100"}`}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      )}
      {data.pricePosition === "above_cart" && (
        <p
          className="text-lg font-bold"
          style={{ color: theme.colors.primary }}
        >
          ₦12,500
        </p>
      )}
      <button
        className="w-full py-2 rounded text-sm font-semibold text-white flex items-center justify-center gap-2"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <ShoppingCart className="h-4 w-4" />
        {data.addToCartButtonText}
      </button>
    </div>
  );
}

function ProductTabsPreview({
  component,
}: {
  component: Extract<PageComponent, { type: "product_tabs" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  const enabledTabs = data.tabs.filter((t) => t.enabled);
  const activeTab =
    enabledTabs.find((t) => t.id === data.defaultTab) ?? enabledTabs[0];

  const tabClass = (isActive: boolean) => {
    if (data.tabStyle === "underline")
      return `px-4 py-2 text-sm font-medium border-b-2 ${isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`;
    if (data.tabStyle === "pills")
      return `px-3 py-1.5 rounded-full text-sm font-medium ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-500"}`;
    return `px-4 py-2 text-sm font-medium border ${isActive ? "bg-white border-b-white -mb-px" : "bg-gray-50 text-gray-500"}`;
  };

  return (
    <div className="border rounded overflow-hidden">
      <div
        className={`flex ${data.tabStyle === "pills" ? "gap-2 p-2 bg-gray-50" : "border-b bg-gray-50"}`}
      >
        {enabledTabs.map((tab) => (
          <button key={tab.id} className={tabClass(tab.id === activeTab?.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab ? (
          <div
            className="prose prose-sm max-w-none line-clamp-3 text-gray-600"
            dangerouslySetInnerHTML={{ __html: activeTab.content }}
          />
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <BookOpen className="h-5 w-5" />
            <span className="text-sm">No tabs configured</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RelatedProductsPreview({
  component,
  theme,
}: {
  component: Extract<PageComponent, { type: "related_products" }>;
  theme: ThemeConfig;
}) {
  const { data } = component;
  return (
    <div>
      <h2
        className="text-lg font-bold mb-3"
        style={{ color: theme.colors.text }}
      >
        {data.title}
      </h2>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(data.columns, 4)}, 1fr)`,
        }}
      >
        {Array.from({ length: Math.min(data.limit, 4) }).map((_, i) => (
          <div
            key={i}
            className={`rounded overflow-hidden ${data.cardStyle === "shadow" ? "shadow" : data.cardStyle === "bordered" ? "border" : ""}`}
          >
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <div className="p-2">
              <div className="h-3 bg-gray-200 rounded mb-1" />
              <div className="h-2.5 bg-gray-100 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
