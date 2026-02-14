import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { PaginatedResponse } from "@/responses/paginatedResponses";
import type { StorefrontProduct } from "@/types/storefront.product";

/**
 * Fetch public storefront products (no auth required)
 *
 * Endpoint: GET /storefronts/{storefront_id}/products/public
 *
 * Returns only visible products for public consumption.
 */
export const fetchPublicStorefrontProducts = async (
  ctx: QueryFunctionContext<
    ["public-storefront-products", string, number, number]
  >,
): Promise<PaginatedResponse<StorefrontProduct>> => {
  const [, storefrontId, page, pageSize] = ctx.queryKey;

  const { data } = await apiClient.get<PaginatedResponse<StorefrontProduct>>(
    `/storefronts/${storefrontId}/products/public`,
    {
      params: {
        page,
        page_size: pageSize,
      },
    },
  );

  return data;
};
