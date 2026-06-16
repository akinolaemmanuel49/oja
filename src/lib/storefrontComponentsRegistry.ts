/**
 * Storefront Component Registry
 *
 * Single source of truth for all available components — their defaults,
 * labels, icons, and which pages they are allowed on.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  ComponentDefinition,
  ComponentType,
  PageComponent,
  PageType,
} from "@/types/storefront.design";

// ============================================================================
// REGISTRY
// ============================================================================

export const COMPONENT_REGISTRY: Record<ComponentType, ComponentDefinition> = {
  // ──────────────────────────────
  // SHARED (all pages)
  // ──────────────────────────────

  hero: {
    type: "hero",
    label: "Hero Section",
    icon: "Sparkles",
    description: "Large header with title, subtitle, and optional CTA button",
    allowedPages: ["home", "products", "product_detail"],
    defaultData: {
      title: "Welcome to Our Store",
      subtitle: "Discover amazing products",
      height: "large",
      textAlign: "center",
      textColor: "#ffffff",
      backgroundColor: "#1e293b",
      overlay: { enabled: true, color: "#000000", opacity: 40 },
      cta: {
        enabled: true,
        text: "Shop Now",
        url: "/products",
        style: "primary",
      },
    },
  },

  banner: {
    type: "banner",
    label: "Image Banner",
    icon: "Image",
    description: "Rotating image carousel / promotional banner",
    allowedPages: ["home", "products", "product_detail"],
    defaultData: {
      images: [],
      autoPlay: true,
      interval: 5000,
      height: "medium",
      showDots: true,
      showArrows: true,
    },
  },

  text: {
    type: "text",
    label: "Text Block",
    icon: "Type",
    description: "Rich text content block",
    allowedPages: ["home", "products", "product_detail"],
    defaultData: {
      content: "<p>Add your content here...</p>",
      maxWidth: "medium",
      textAlign: "left",
      padding: "medium",
    },
  },

  image_gallery: {
    type: "image_gallery",
    label: "Image Gallery",
    icon: "Images",
    description: "Grid or masonry layout of images",
    allowedPages: ["home", "products", "product_detail"],
    defaultData: {
      images: [],
      layout: "grid",
      columns: 3,
      gap: "medium",
    },
  },

  spacer: {
    type: "spacer",
    label: "Spacer",
    icon: "Space",
    description: "Vertical spacing between sections",
    allowedPages: ["home", "products", "product_detail"],
    defaultData: { height: "medium" },
  },

  // ──────────────────────────────
  // HOME-ONLY
  // ──────────────────────────────

  product_grid: {
    type: "product_grid",
    label: "Product Grid",
    icon: "Grid3x3",
    description:
      "Grid layout of products with configurable columns and sorting",
    allowedPages: ["home", "products"],
    defaultData: {
      title: "Products",
      columns: 4,
      limit: 12,
      sortOrder: "newest_first",
      showPrice: true,
      showSku: false,
      showAddToCart: false,
      cardStyle: "shadow",
      spacing: "normal",
    },
  },

  product_carousel: {
    type: "product_carousel",
    label: "Product Carousel",
    icon: "Repeat",
    description: "Horizontal scrolling product carousel",
    allowedPages: ["home", "products"],
    defaultData: {
      title: "New Arrivals",
      limit: 10,
      sortOrder: "newest_first",
      itemsPerView: 4,
      showPrice: true,
      showSku: false,
      autoPlay: false,
      interval: 5000,
    },
  },

  // ──────────────────────────────
  // PRODUCTS PAGE
  // ──────────────────────────────

  products_header: {
    type: "products_header",
    label: "Products Header",
    icon: "ListFilter",
    description: "Page title, subtitle, and default sort order for the listing",
    allowedPages: ["products"],
    defaultData: {
      title: "All Products",
      subtitle: "",
      defaultSortOrder: "newest_first",
      showResultCount: true,
      showSortDropdown: true,
    },
  },

  products_filter_bar: {
    type: "products_filter_bar",
    label: "Filter Bar",
    icon: "SlidersHorizontal",
    description: "Price and type filters above the product listing",
    allowedPages: ["products"],
    defaultData: {
      showPriceFilter: true,
      showTypeFilter: true,
      filterPosition: "top",
      sticky: false,
    },
  },

  // ──────────────────────────────
  // PRODUCT DETAIL PAGE
  // ──────────────────────────────

  product_images: {
    type: "product_images",
    label: "Product Images",
    icon: "ImagePlay",
    description: "Main image display with thumbnail strip",
    allowedPages: ["product_detail"],
    defaultData: {
      layout: "carousel",
      mainImageAspect: "square",
      showThumbnails: true,
      thumbnailPosition: "bottom",
      zoomOnHover: true,
    },
  },

  product_info: {
    type: "product_info",
    label: "Product Info",
    icon: "ShoppingBag",
    description: "Name, price, variants, quantity, and add-to-cart block",
    allowedPages: ["product_detail"],
    defaultData: {
      showSku: true,
      showStockStatus: true,
      showVariantSelector: true,
      variantSelectorStyle: "buttons",
      showQuantitySelector: true,
      addToCartButtonText: "Add to Cart",
      showShareButtons: false,
      pricePosition: "below_name",
    },
  },

  product_tabs: {
    type: "product_tabs",
    label: "Product Tabs",
    icon: "BookOpen",
    description: "Tabbed sections for description, specifications, etc.",
    allowedPages: ["product_detail"],
    defaultData: {
      tabs: [
        {
          id: "tab-description",
          label: "Description",
          content: "<p>Product description goes here...</p>",
          enabled: true,
        },
        // {
        //   id: "tab-specs",
        //   label: "Specifications",
        //   content: "<p>Product specifications...</p>",
        //   enabled: true,
        // },
      ],
      defaultTab: "tab-description",
      tabStyle: "underline",
    },
  },

  related_products: {
    type: "related_products",
    label: "Related Products",
    icon: "LayoutGrid",
    description: '"You may also like" product grid at bottom of detail page',
    allowedPages: ["product_detail"],
    defaultData: {
      title: "You May Also Like",
      limit: 4,
      sortOrder: "newest_first",
      columns: 4,
      cardStyle: "shadow",
    },
  },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create a new component instance with default data and a fresh UUID.
 */
export function createComponent(
  type: ComponentType,
  order: number,
): PageComponent {
  const definition = COMPONENT_REGISTRY[type];
  return {
    id: uuidv4(),
    type,
    order,
    // Spread so each instance gets its own copy — no shared references
    data: structuredClone(definition.defaultData),
  } as PageComponent;
}

/**
 * Return only the components allowed for a given page type.
 * Used by the sidebar to filter what it shows.
 */
export function getComponentsForPage(page: PageType): ComponentDefinition[] {
  return Object.values(COMPONENT_REGISTRY).filter((def) =>
    def.allowedPages.includes(page),
  );
}

// ============================================================================
// DEFAULT THEME
// ============================================================================

export const DEFAULT_THEME = {
  colors: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#f59e0b",
    background: "#ffffff",
    text: "#1f2937",
    textSecondary: "#6b7280",
  },
  fonts: {
    heading: "system-ui, -apple-system, sans-serif",
    body: "system-ui, -apple-system, sans-serif",
  },
  borderRadius: "medium" as const,
};

// ============================================================================
// DEFAULT PAGE COMPONENTS
// ============================================================================

/**
 * Pre-seeded components for each page so the canvas is never blank
 * when the designer first opens.
 */
export const DEFAULT_PAGE_COMPONENTS: Record<PageType, PageComponent[]> = {
  home: [createComponent("hero", 0), createComponent("product_grid", 1)],
  products: [
    createComponent("products_header", 0),
    createComponent("products_filter_bar", 1),
    createComponent("product_grid", 2),
  ],
  product_detail: [
    createComponent("product_images", 0),
    createComponent("product_info", 1),
    createComponent("product_tabs", 2),
    createComponent("related_products", 3),
  ],
};
