import type { ProductUpdate } from "@/types/product";
import type { FormData } from "../types";

export function transformEditFormToApiPayload(
  formData: FormData,
): ProductUpdate {
  const payload: ProductUpdate = {
    name: formData.name,
    description: formData.description,
    type: formData.type,
  };

  if (formData.type === "simple") {
    payload.base_price = formData.base_price;
    payload.sku = formData.sku;
    payload.stock_quantity = formData.stock_quantity;
    payload.re_order_level = formData.re_order_level;
    payload.main_image_url = formData.main_image_url;
    payload.image_urls = formData.image_urls;
  }

  if (formData.type === "variable") {
    if (formData.variants_to_add && formData.variants_to_add.length > 0) {
      payload.variants_to_add = formData.variants_to_add.map((variant) => ({
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

    if (formData.variants_to_update && formData.variants_to_update.length > 0) {
      payload.variants_to_update = formData.variants_to_update.map(
        (variant) => ({
          id: variant.id,
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
        }),
      );
    }

    payload.variants_to_remove = formData.variants_to_remove;
  }

  return payload;
}
