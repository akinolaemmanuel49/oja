import type { Product } from "@/types/product";
import type { FormData } from "../types";

export function transformProductToFormData(product: Product): FormData {
  return {
    name: product.name,
    description: product.description ?? undefined,
    type: product.type,
    base_price: product.base_price ?? undefined,
    sku: product.sku ?? undefined,
    stock_quantity: product.stock_quantity ?? undefined,
    re_order_level: product.re_order_level ?? undefined,
    image_urls: product.image_urls ?? [],
    main_image_url: product.main_image_url ?? undefined,
    variants_to_add: [],
    variants_to_update:
      product.variants?.map((v) => ({
        id: v.id,
        sku: v.sku ?? undefined,
        price: v.price ?? undefined,
        stock_quantity: v.stock_quantity,
        re_order_level: v.re_order_level,
        attributePairs: Object.entries(v.attributes || {}).map(
          ([key, value]) => ({ key, value }),
        ),
        main_image_url: v.main_image_url ?? undefined,
        image_urls: v.image_urls ?? [],
      })) ?? [],
    variants_to_remove: [],
  };
}
