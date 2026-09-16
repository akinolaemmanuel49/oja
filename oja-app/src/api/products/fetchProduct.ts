import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { Product } from "@/types/product";

export const fetchProduct = async (
  ctx: QueryFunctionContext<[string, string]>,
): Promise<Product> => {
  const [, productId] = ctx.queryKey;
  const { data } = await apiClient.get<Product>(`/products/${productId}`);
  return data;
};
