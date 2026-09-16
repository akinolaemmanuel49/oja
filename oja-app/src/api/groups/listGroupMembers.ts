import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { PaginatedResponse } from "@/responses/paginatedResponse";
import type { GroupMember } from "@/types/group";

export async function listGroupMembers(
  ctx: QueryFunctionContext<[string, string, number, number]>,
): Promise<PaginatedResponse<GroupMember>> {
  const [, groupId, page, pageSize] = ctx.queryKey;
  const { data } = await apiClient.get(`/groups/${groupId}/members`, {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return data;
}
