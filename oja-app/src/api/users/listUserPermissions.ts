import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { PaginatedResponse } from "@/responses/paginatedResponse";
import type { UserPermission } from "@/types/user";

export async function listUserPermissions(
  ctx: QueryFunctionContext<[string, string, number, number]>,
): Promise<PaginatedResponse<UserPermission>> {
  const [, userId, page, pageSize] = ctx.queryKey;
  const { data } = await apiClient.get(`/users/${userId}/permissions`, {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return data;
}
