/**
 * Fetch storefront design configuration
 */
import apiClient from "../client";
import type { StorefrontDesign } from "@/types/storefront.design";
import type { QueryFunctionContext } from "@tanstack/react-query";

export async function fetchStorefrontDesign({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<StorefrontDesign | null> {
  const [, storefrontId] = queryKey;

  const { data } = await apiClient.get<{
    design_config: StorefrontDesign | null;
  }>(`/storefronts/${storefrontId}/design`);

  return data.design_config;
}
