import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { StorefrontOrder } from "@/types/order";

export const fetchStorefrontOrders = async (
  ctx: QueryFunctionContext<
    ["storefront-orders", string, string | undefined]
  >,
): Promise<StorefrontOrder[]> => {
  const [, storefrontId, status] = ctx.queryKey;

  const { data } = await apiClient.get<StorefrontOrder[]>("/orders/manage", {
    params: {
      storefront_id: storefrontId,
      ...(status ? { status } : {}),
    },
  });

  return data;
};