import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { StorefrontOrder } from "@/types/order";

export const fetchStorefrontOrder = async (
  ctx: QueryFunctionContext<["storefront-order", string]>,
): Promise<StorefrontOrder> => {
  const [, orderId] = ctx.queryKey;

  const { data } = await apiClient.get<StorefrontOrder>(
    `/orders/manage/${orderId}`,
  );

  return data;
};