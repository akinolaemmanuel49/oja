import type { PaginatedResponse } from "@/responses/paginatedResponse";
import type { StorefrontProduct } from "@/types/storefront.product";
import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";

/**
 * Fetch all products in a storefront
 */
export async function fetchStorefrontProducts({
    queryKey,
}: QueryFunctionContext<
    [string, string, number, number]
>): Promise<PaginatedResponse<StorefrontProduct>> {
    const [, storefrontId, page, pageSize] = queryKey;

    const response = await apiClient.get(
        `/storefronts/${storefrontId}/products`,
        {
            params: { page, page_size: pageSize },
        }
    );

    return response.data;
}