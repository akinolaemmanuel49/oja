import type { CreateProduct } from "@/types/product";
import type { FormData } from "../types";

/**
 * Helper functions (transformers)
 */
export function transformFormDataToApiPayload(
  formData: FormData,
): CreateProduct {
  const payload: CreateProduct = {
    name: formData.name,
    description: formData.description || undefined,
    type: formData.type,
  };

  if (formData.type === "simple") {
    // Wrap simple fields inside a "simple" object
    payload.simple = {
      base_price: formData.simple?.base_price ?? 0,
      sku: formData.simple?.sku ?? "",
      stock_quantity: formData.simple?.stock_quantity ?? 0,
      re_order_level: formData.simple?.re_order_level ?? 0,
    };

    // Add images for simple products
    if (formData.image_urls?.length) {
      payload.image_urls = formData.image_urls;
    }
    if (formData.main_image_url) {
      payload.main_image_url = formData.main_image_url;
    }
  }

  if (formData.type === "variable" && formData.variants) {
    payload.variants = formData.variants.map((variant) => ({
      sku: variant.sku,
      price: variant.price,
      stock_quantity: variant.stock_quantity,
      re_order_level: variant.re_order_level,
      attributes: variant.attributePairs.reduce(
        (acc, pair) => {
          if (pair.key.trim() && pair.value.trim()) {
            acc[pair.key.trim()] = pair.value.trim();
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
      main_image_url: variant.main_image_url,
      image_urls: variant.image_urls,
    }));
  }

  return payload;
}
