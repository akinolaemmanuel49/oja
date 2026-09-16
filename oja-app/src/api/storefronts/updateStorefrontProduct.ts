import type { UpdateStorefrontProductRequest } from "@/types/storefront.product";
import apiClient from "../client";

/**
 * Update a product's settings in a storefront
 */
export async function updateStorefrontProduct(
    storefrontId: string,
    productId: string,
    data: UpdateStorefrontProductRequest
): Promise<void> {
    await apiClient.patch(
        `/storefronts/${storefrontId}/products/${productId}`,
        data
    );
}