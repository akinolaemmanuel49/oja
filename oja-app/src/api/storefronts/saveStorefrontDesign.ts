/**
 * Save storefront design configuration
 */
import apiClient from "../client";
import type { StorefrontDesign } from "@/types/storefront.design";

export async function saveStorefrontDesign(
  storefrontId: string,
  designConfig: StorefrontDesign,
): Promise<{ message: string }> {
  const { data } = await apiClient.put(`/storefronts/${storefrontId}/design`, {
    design_config: designConfig,
  });
  return data;
}
