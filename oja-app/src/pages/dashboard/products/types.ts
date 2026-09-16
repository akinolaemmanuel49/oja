export type FormData = {
  name: string;
  description?: string;
  type: "simple" | "variable";

  // Simple product fields
  base_price?: number;
  sku?: string;
  stock_quantity?: number;
  re_order_level?: number;

  // Simple product images (only for simple products)
  image_urls?: string[];
  main_image_url?: string;

  // Variable product variants
  variants_to_add?: Array<{
    sku: string;
    price: number;
    stock_quantity: number;
    re_order_level: number;
    attributePairs: Array<{ key: string; value: string }>;
    main_image_url?: string;
    image_urls?: string[];
  }>;

  variants_to_update?: Array<{
    id: string;
    sku?: string;
    price?: number;
    stock_quantity?: number;
    re_order_level?: number;
    attributePairs: Array<{ key: string; value: string }>;
    main_image_url?: string;
    image_urls?: string[];
  }>;

  variants_to_remove?: string[];

  variants?: Array<{
    sku: string;
    price: number;
    stock_quantity: number;
    re_order_level: number;
    attributePairs: Array<{ key: string; value: string }>;
    main_image_url?: string;
    image_urls?: string[];
  }>;

  simple?: {
    base_price: number;
    sku: string;
    stock_quantity: number;
    re_order_level: number;
  };
};
