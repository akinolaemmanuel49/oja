import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { PaginatedResponse } from "@/responses/paginatedResponse";
import type { Group } from "@/types/group";

export async function listUserGroups(
  ctx: QueryFunctionContext<[string, string, number, number]>,
): Promise<PaginatedResponse<Group>> {
  const [, userId, page, pageSize] = ctx.queryKey;
  const { data } = await apiClient.get(`/users/${userId}/groups`, {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return data;
}
