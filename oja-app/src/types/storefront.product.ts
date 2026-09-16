import type { ProductVariant } from "./product";

/**
 * Represents a product within a storefront context
 * Includes both product details and storefront-specific settings
 */
export type StorefrontProduct = {
    // Product details
    product_id: string;
    product_name: string;
    product_type: "simple" | "variable";
    product_description?: string | null;
    base_price?: number | null;
    sku?: string | null;
    main_image_url?: string | null;

    // Storefront-specific settings
    display_order: number;
    is_visible: boolean;

    variants?: ProductVariant[];
};

/**
 * Request payload for adding a product to a storefront
 */
export type AddProductToStorefrontRequest = {
    product_id: string;
    display_order?: number;
    is_visible?: boolean;
};

/**
 * Request payload for bulk adding products to a storefront
 */
export type BulkAddProductsToStorefrontRequest = {
    product_ids: string[];
    is_visible?: boolean;
};

/**
 * Request payload for updating a product's storefront settings
 */
export type UpdateStorefrontProductRequest = {
    display_order?: number;
    is_visible?: boolean;
};

/**
 * Response from bulk add operation
 */
export type BulkAddProductsResponse = {
    added: number;
    skipped: number;
    total: number;
    errors?: string[] | null;
};