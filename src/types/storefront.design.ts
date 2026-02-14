/**
 * Storefront Design System - Type Definitions
 *
 * This defines the complete JSON schema for storefront pages.
 * The spec can be serialized/deserialized and used to render storefronts.
 */

// ============================================================================
// PAGE TYPES
// ============================================================================

/**
 * The three pages a storefront can have.
 * Each page has its own allowed component set.
 */
export type PageType = "home" | "products" | "product_detail";

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  home: "Home",
  products: "Products",
  product_detail: "Product Detail",
};

// ============================================================================
// COMPONENT TYPES — grouped by which pages allow them
// ============================================================================

/** Components available on ALL pages */
export type SharedComponentType =
  | "hero"
  | "banner"
  | "text"
  | "image_gallery"
  | "spacer";

/** Components only available on the Home page */
export type HomeOnlyComponentType = "product_grid" | "product_carousel";

/** Components only available on the Products listing page */
export type ProductsOnlyComponentType =
  | "products_header" // Title/subtitle/sort bar at top of listing
  | "products_filter_bar"; // Category/price filter row

/** Components only available on the Product Detail page */
export type ProductDetailOnlyComponentType =
  | "product_images" // Main image + thumbnail strip
  | "product_info" // Name, price, variants, add-to-cart area
  | "product_tabs" // Description / specs / reviews tabs
  | "related_products"; // "You may also like" grid at bottom

export type ComponentType =
  | SharedComponentType
  | HomeOnlyComponentType
  | ProductsOnlyComponentType
  | ProductDetailOnlyComponentType;

/** Which component types are allowed per page */
export const ALLOWED_COMPONENTS_BY_PAGE: Record<PageType, ComponentType[]> = {
  home: [
    "hero",
    "banner",
    "text",
    "image_gallery",
    "spacer",
    "product_grid",
    "product_carousel",
  ],
  products: [
    "products_header",
    "products_filter_bar",
    "text",
    "banner",
    "spacer",
  ],
  product_detail: [
    "product_images",
    "product_info",
    "product_tabs",
    "related_products",
    "text",
    "spacer",
  ],
};

// ============================================================================
// SORT/FILTER OPTIONS
// ============================================================================

export type ProductSortOrder =
  | "newest_first" // Created date DESC
  | "oldest_first" // Created date ASC
  | "price_low_high" // Price ASC
  | "price_high_low" // Price DESC
  | "name_a_z" // Name ASC
  | "name_z_a"; // Name DESC

// ============================================================================
// BASE COMPONENT INTERFACE
// ============================================================================

interface BaseComponent {
  id: string;
  type: ComponentType;
  order: number; // Position in the page (0-indexed)
}

// ============================================================================
// SHARED COMPONENTS (available on all pages)
// ============================================================================

export interface HeroComponent extends BaseComponent {
  type: "hero";
  data: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    height: "small" | "medium" | "large" | "full";
    textAlign: "left" | "center" | "right";
    textColor: string;
    overlay?: {
      enabled: boolean;
      color: string;
      opacity: number; // 0-100
    };
    cta?: {
      enabled: boolean;
      text: string;
      url: string;
      style: "primary" | "secondary" | "outline";
    };
  };
}

export interface BannerComponent extends BaseComponent {
  type: "banner";
  data: {
    images: Array<{
      url: string;
      alt?: string;
      link?: string;
    }>;
    autoPlay: boolean;
    interval: number;
    height: "small" | "medium" | "large";
    showDots: boolean;
    showArrows: boolean;
  };
}

export interface TextComponent extends BaseComponent {
  type: "text";
  data: {
    content: string; // HTML from rich text editor
    maxWidth: "full" | "narrow" | "medium" | "wide";
    textAlign: "left" | "center" | "right";
    backgroundColor?: string;
    padding: "none" | "small" | "medium" | "large";
  };
}

export interface ImageGalleryComponent extends BaseComponent {
  type: "image_gallery";
  data: {
    images: Array<{
      url: string;
      alt?: string;
      caption?: string;
    }>;
    layout: "grid" | "masonry";
    columns: 2 | 3 | 4;
    gap: "small" | "medium" | "large";
  };
}

export interface SpacerComponent extends BaseComponent {
  type: "spacer";
  data: {
    height: "small" | "medium" | "large" | "xlarge";
  };
}

// ============================================================================
// HOME-ONLY COMPONENTS
// ============================================================================

export interface ProductGridComponent extends BaseComponent {
  type: "product_grid";
  data: {
    title?: string;
    columns: 2 | 3 | 4 | 5 | 6;
    limit: number;
    sortOrder: ProductSortOrder;
    showPrice: boolean;
    showSku: boolean;
    showAddToCart: boolean;
    cardStyle: "minimal" | "bordered" | "shadow";
    spacing: "compact" | "normal" | "relaxed";
  };
}

export interface ProductCarouselComponent extends BaseComponent {
  type: "product_carousel";
  data: {
    title?: string;
    limit: number;
    sortOrder: ProductSortOrder;
    itemsPerView: 2 | 3 | 4 | 5;
    showPrice: boolean;
    showSku: boolean;
    autoPlay: boolean;
    interval: number;
  };
}

// ============================================================================
// PRODUCTS PAGE COMPONENTS
// ============================================================================

/**
 * Top header bar of the products listing page.
 * Controls the page title, subtitle, and default sort order.
 */
export interface ProductsHeaderComponent extends BaseComponent {
  type: "products_header";
  data: {
    title: string; // e.g. "All Products"
    subtitle?: string;
    defaultSortOrder: ProductSortOrder;
    showResultCount: boolean; // "Showing 24 products"
    showSortDropdown: boolean; // Let the user re-sort on the storefront
  };
}

/**
 * Filter bar shown above the product grid on the listing page.
 * No dynamic categories from the backend — just visual config.
 */
export interface ProductsFilterBarComponent extends BaseComponent {
  type: "products_filter_bar";
  data: {
    showPriceFilter: boolean;
    showTypeFilter: boolean; // simple / variable
    filterPosition: "top" | "side"; // layout preference
    sticky: boolean; // stick to top while scrolling
  };
}

// ============================================================================
// PRODUCT DETAIL COMPONENTS
// ============================================================================

/**
 * Image section of the product detail page.
 * Controls layout of the main image and thumbnails.
 */
export interface ProductImagesComponent extends BaseComponent {
  type: "product_images";
  data: {
    layout: "stack" | "grid" | "carousel"; // how thumbnails are shown
    mainImageAspect: "square" | "portrait" | "landscape";
    showThumbnails: boolean;
    thumbnailPosition: "bottom" | "left";
    zoomOnHover: boolean;
  };
}

/**
 * Core product info block: name, price, variant selector, quantity, add-to-cart.
 * This is always rendered from live product data on the storefront side —
 * here we only control layout/visibility of each sub-section.
 */
export interface ProductInfoComponent extends BaseComponent {
  type: "product_info";
  data: {
    showSku: boolean;
    showStockStatus: boolean;
    showVariantSelector: boolean; // color/size swatches
    variantSelectorStyle: "dropdown" | "buttons"; // how variant options render
    showQuantitySelector: boolean;
    addToCartButtonText: string; // e.g. "Add to Cart", "Buy Now"
    showShareButtons: boolean;
    pricePosition: "below_name" | "above_cart"; // layout
  };
}

/**
 * Tabbed content section below the main product block.
 * Each tab is a rich-text area.
 */
export interface ProductTabsComponent extends BaseComponent {
  type: "product_tabs";
  data: {
    tabs: Array<{
      id: string;
      label: string; // "Description", "Specifications", etc.
      content: string; // HTML from rich text editor
      enabled: boolean;
    }>;
    defaultTab: string; // id of the tab open by default
    tabStyle: "underline" | "pills" | "boxed";
  };
}

/**
 * "Related / You May Also Like" product grid at the bottom of detail page.
 */
export interface RelatedProductsComponent extends BaseComponent {
  type: "related_products";
  data: {
    title: string;
    limit: number;
    sortOrder: ProductSortOrder;
    columns: 2 | 3 | 4;
    cardStyle: "minimal" | "bordered" | "shadow";
  };
}

// ============================================================================
// UNION TYPE — ALL COMPONENTS
// ============================================================================

export type PageComponent =
  // Shared
  | HeroComponent
  | BannerComponent
  | TextComponent
  | ImageGalleryComponent
  | SpacerComponent
  // Home
  | ProductGridComponent
  | ProductCarouselComponent
  // Products page
  | ProductsHeaderComponent
  | ProductsFilterBarComponent
  // Product detail page
  | ProductImagesComponent
  | ProductInfoComponent
  | ProductTabsComponent
  | RelatedProductsComponent;

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: "none" | "small" | "medium" | "large";
}

// ============================================================================
// PAGE SPEC
// ============================================================================

export interface PageSpec {
  version: string;
  createdAt: string;
  updatedAt: string;
  meta: {
    title: string;
    description?: string;
  };
  theme: ThemeConfig;
  components: PageComponent[];
}

// ============================================================================
// STOREFRONT DESIGN — multi-page
// ============================================================================

export interface StorefrontDesign {
  version: string;
  storefrontId: string;
  storefrontName: string;
  /**
   * Theme is shared across ALL pages — one source of truth.
   */
  theme: ThemeConfig;
  pages: {
    home: Omit<PageSpec, "theme">;
    products: Omit<PageSpec, "theme">;
    product_detail: Omit<PageSpec, "theme">;
  };
}

// ============================================================================
// BUILDER HELPER TYPES
// ============================================================================

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string; // Lucide icon name
  description: string;
  /** Which pages this component can be added to */
  allowedPages: PageType[];
  defaultData: PageComponent["data"];
}

export interface DragItem {
  type: ComponentType;
  index?: number;
}
