// ============================================================================
// MOCK DATA – used when useMockData is true
// ============================================================================

import type { StorefrontProduct } from "@/types/storefront.product";

export const MOCK_PRODUCTS: StorefrontProduct[] = [
  {
    product_id: "prod-001",
    product_name: "Classic Cotton T-Shirt",
    product_type: "simple",
    product_description: "Soft and comfortable everyday t-shirt",
    base_price: 8500,
    sku: "TSHIRT-BLK-M",
    main_image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    display_order: 1,
    is_visible: true,
  },
  {
    product_id: "prod-002",
    product_name: "Wireless Earbuds Pro",
    product_type: "simple",
    base_price: 28500,
    sku: "EARBUD-PRO",
    main_image_url:
      "https://images.unsplash.com/photo-1605640840605-14ac0ac9929f?w=400",
    display_order: 2,
    is_visible: true,
  },
  {
    product_id: "prod-003",
    product_name: "Running Shoes",
    product_type: "variable",
    base_price: null,
    sku: null,
    main_image_url: null,
    display_order: 3,
    is_visible: true,
    variants: [
      {
        id: "var-001",
        product_id: "prod-003",
        sku: "SHOE-BLK-42",
        price: 52000,
        stock_quantity: 18,
        re_order_level: 5,
        attributes: { Color: "Black", Size: "42" },
        main_image_url:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        image_urls: [],
        created_at: "2025-01-10T10:00:00Z",
        updated_at: "2025-01-10T10:00:00Z",
      },
      {
        id: "var-002",
        product_id: "prod-003",
        sku: "SHOE-WHT-43",
        price: 52000,
        stock_quantity: 12,
        re_order_level: 5,
        attributes: { Color: "White", Size: "43" },
        main_image_url:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
        image_urls: [],
        created_at: "2025-01-10T10:00:00Z",
        updated_at: "2025-01-10T10:00:00Z",
      },
    ],
  },
  {
    product_id: "prod-004",
    product_name: "Leather Crossbody Bag",
    product_type: "simple",
    base_price: 38500,
    sku: "BAG-CROSS-BR",
    main_image_url:
      "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400",
    display_order: 4,
    is_visible: true,
  },
  {
    product_id: "prod-005",
    product_name: "Smart Watch Series 8",
    product_type: "variable",
    variants: [
      {
        id: "var-005-1",
        product_id: "prod-005",
        sku: "WATCH-SIL-44",
        price: 95000,
        stock_quantity: 7,
        re_order_level: 3,
        attributes: { Color: "Silver", Size: "44mm" },
        main_image_url:
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
        image_urls: [],
        created_at: "2025-02-01T09:00:00Z",
        updated_at: "2025-02-01T09:00:00Z",
      },
      {
        id: "var-005-2",
        product_id: "prod-005",
        sku: "WATCH-BLK-40",
        price: 95000,
        stock_quantity: 14,
        re_order_level: 3,
        attributes: { Color: "Black", Size: "40mm" },
        main_image_url:
          "https://images.unsplash.com/photo-1617048838693-2d9c4d8d3a7c?w=400",
        image_urls: [],
        created_at: "2025-02-01T09:00:00Z",
        updated_at: "2025-02-01T09:00:00Z",
      },
    ],
    display_order: 5,
    is_visible: true,
  },
  {
    product_id: "prod-006",
    product_name: "Denim Jacket",
    product_type: "simple",
    base_price: 45000,
    sku: "JACKET-DNM-L",
    main_image_url:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    display_order: 6,
    is_visible: true,
  },
  {
    product_id: "prod-007",
    product_name: "Coffee Maker Deluxe",
    product_type: "simple",
    base_price: 62000,
    sku: "COFFEE-DLX",
    main_image_url:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400",
    display_order: 7,
    is_visible: true,
  },
  {
    product_id: "prod-008",
    product_name: "Yoga Mat Premium",
    product_type: "simple",
    base_price: 12500,
    sku: "YOGA-PREM",
    main_image_url:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    display_order: 8,
    is_visible: true,
  },
];
