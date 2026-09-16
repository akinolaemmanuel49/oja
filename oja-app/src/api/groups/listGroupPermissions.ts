import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { PaginatedResponse } from "@/responses/paginatedResponse";
import type { GroupPermission } from "@/types/group";

export async function listGroupPermissions(
  ctx: QueryFunctionContext<[string, string, number, number]>,
): Promise<PaginatedResponse<GroupPermission>> {
  const [, groupId, page, pageSize] = ctx.queryKey;
  const { data } = await apiClient.get(`/groups/${groupId}/permissions`, {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return data;
}
