import type { Product, ProductUpdate } from "@/types/product";
import apiClient from "../client";

export async function updateProduct(
  productId: string,
  productData: ProductUpdate,
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(
    `/products/${productId}`,
    productData,
  );
  return data;
}

export type UpdateProductMutationFnParams = {
  productId: string;
  productUpdate: ProductUpdate;
};

export const UpdateProductMutationFn = async ({
  productId,
  productUpdate,
}: UpdateProductMutationFnParams) => updateProduct(productId, productUpdate);
