import type { CreateProduct, Product } from "@/types/product";
import apiClient from "../client";

export async function createProduct(
  productData: CreateProduct,
): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products", productData);
  return data;
}
