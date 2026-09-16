import type { BulkAddProductsToStorefrontRequest, BulkAddProductsResponse } from "@/types/storefront.product";
import apiClient from "../client";

/**
 * Add multiple products to a storefront at once
 */
export async function bulkAddProductsToStorefront(
    storefrontId: string,
    data: BulkAddProductsToStorefrontRequest
): Promise<BulkAddProductsResponse> {
    const response = await apiClient.post(
        `/storefronts/${storefrontId}/products/bulk`,
        data
    );
    return response.data;
}