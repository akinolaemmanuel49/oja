// ────────────────────────────────────────────────
//  Core Product Types
// ────────────────────────────────────────────────

export type ProductType = "simple" | "variable";

/**
 * Main Product entity as returned from the API
 *
 * Image handling strategy:
 * - Simple products: have their own main_image_url and image_urls at product level
 * - Variable products: images come from individual variants (no product-level images)
 */
export type Product = {
  id: string;
  tenant_id: string;
  type: ProductType;
  name: string;
  description?: string | null;

  // Simple product fields - only populated when type === "simple"
  base_price?: number | null;
  sku?: string | null;
  stock_quantity?: number | null;
  re_order_level?: number | null;

  // Images for SIMPLE products only
  // For variable products, these will be null/empty - images come from variants
  main_image_url?: string | null;
  image_urls?: string[] | null;

  // Common fields
  created_at: string;
  updated_at: string;

  // Variants - only populated when type === "variable"
  variants?: ProductVariant[];

  // Storefront-specific metadata (optional)
  is_visible?: boolean;
  display_order?: number;
};

/**
 * Product Variant entity
 * Used for variable products where each variant has different attributes (e.g., color, size)
 * Each variant has its own images
 */
export type ProductVariant = {
  id: string;
  product_id: string;
  sku?: string | null;
  price?: number | null;
  stock_quantity: number;
  re_order_level: number;

  // Key-value pairs defining variant characteristics (e.g., {color: "red", size: "M"})
  attributes: Record<string, string>;

  // Images specific to this variant
  main_image_url?: string | null;
  image_urls?: string[] | null;

  created_at: string;
  updated_at: string;
};

// ────────────────────────────────────────────────
//  Creation / Input Types
// ────────────────────────────────────────────────

/**
 * Payload for creating a new product
 * Can create either a simple product OR a variable product with variants
 */
export type CreateProduct = {
  name: string;
  description?: string;
  type: ProductType;

  // Simple product fields - used when type === "simple"
  simple?: {
    base_price?: number;
    sku?: string;
    stock_quantity?: number;
    re_order_level?: number;
  };

  // Images for SIMPLE products only
  main_image_url?: string;
  image_urls?: string[];

  // Variable product fields - used when type === "variable"
  // Each variant will have its own images
  variants?: CreateVariantProduct[];
};

/**
 * Payload for creating a single variant within a variable product
 * Each variant has its own image fields
 */
export type CreateVariantProduct = {
  sku?: string;
  price?: number;
  stock_quantity?: number;
  re_order_level?: number;

  // Key-value pairs defining this variant's unique attributes
  attributes?: Record<string, string>;

  // Images specific to this variant
  main_image_url?: string;
  image_urls?: string[];
};

// ────────────────────────────────────────────────
//  Update / Partial Input Types
// ────────────────────────────────────────────────

/**
 * Payload for updating an existing product
 * All fields are optional - only send what you want to change
 * Supports type switching: simple <-> variable
 */
export type ProductUpdate = {
  name?: string;
  description?: string;
  type?: ProductType;

  // Simple product fields - used when type === "simple"
  base_price?: number;
  sku?: string;
  stock_quantity?: number;
  re_order_level?: number;

  // Images for SIMPLE products only
  main_image_url?: string;
  image_urls?: string[];

  // Variable product operations - used when type === "variable"
  // Array of new variants to add to this product
  variants_to_add?: UpdateVariantProduct[];

  // Array of existing variants to update (identified by id)
  variants_to_update?: Array<
    UpdateVariantProduct & {
      id: string;
    }
  >;

  // Array of variant IDs to delete
  variants_to_remove?: string[];
};

/**
 * Payload for updating or creating a variant
 * All fields optional except those required by business logic
 */
export type UpdateVariantProduct = {
  sku?: string;
  price?: number;
  stock_quantity?: number;
  re_order_level?: number;
  attributes?: Record<string, string>;

  // Images specific to this variant
  main_image_url?: string;
  image_urls?: string[];
};

// ────────────────────────────────────────────────
//  Detail / Enriched Types
// ────────────────────────────────────────────────

/**
 * Enriched product data returned from detail endpoints
 * Always includes variants array for variable products
 */
export type ProductDetail = Product & {
  variants?: ProductVariant[];
};
