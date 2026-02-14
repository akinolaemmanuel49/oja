import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { Storefront } from "@/types/storefront";

/**
 * Fetch storefront by slug (public endpoint)
 *
 * Endpoint: GET /storefronts/resolve/{storefront_slug}
 *
 * This is a public endpoint that doesn't require authentication.
 * Returns the storefront details including design_config.
 */
export const fetchStorefrontBySlug = async (
  ctx: QueryFunctionContext<["storefront-by-slug", string]>,
): Promise<Storefront> => {
  const [, slug] = ctx.queryKey;

  const { data } = await apiClient.get<Storefront>(
    `/storefronts/resolve/${slug}`,
  );

  return data;
};
