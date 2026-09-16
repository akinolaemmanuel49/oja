import apiClient from "../client";

/**
 * Remove a product from a storefront
 */
export async function removeProductFromStorefront(
    storefrontId: string,
    productId: string
): Promise<void> {
    await apiClient.delete(`/storefronts/${storefrontId}/products/${productId}`);
}