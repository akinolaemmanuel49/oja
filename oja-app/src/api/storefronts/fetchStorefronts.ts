import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { PaginatedResponse } from "@/responses/paginatedResponse";
import type { Storefront } from "@/types/storefront";

export const fetchStorefronts = async (
  ctx: QueryFunctionContext<[string, number, number]>,
): Promise<PaginatedResponse<Storefront>> => {
  const [, page, pageSize] = ctx.queryKey;

  const { data } = await apiClient.get<PaginatedResponse<Storefront>>(
    `/storefronts`,
    {
      params: {
        page,
        page_size: pageSize,
      },
    },
  );

  return data;
};
