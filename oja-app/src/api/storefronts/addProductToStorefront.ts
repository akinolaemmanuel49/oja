import type { AddProductToStorefrontRequest } from "@/types/storefront.product";
import apiClient from "../client";

/**
 * Add a single product to a storefront
 */
export async function addProductToStorefront(
    storefrontId: string,
    data: AddProductToStorefrontRequest
): Promise<void> {
    await apiClient.post(`/storefronts/${storefrontId}/products`, data);
}