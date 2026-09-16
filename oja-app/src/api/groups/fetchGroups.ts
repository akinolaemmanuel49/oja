import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { PaginatedResponse } from "@/responses/paginatedResponse";
import type { GroupDetail } from "@/types/group";

export const fetchGroups = async (
  ctx: QueryFunctionContext<[string, number, number]>,
): Promise<PaginatedResponse<GroupDetail>> => {
  const [, page, pageSize] = ctx.queryKey;

  const { data } = await apiClient.get<PaginatedResponse<GroupDetail>>(`/groups`, {
    params: {
      page,
      page_size: pageSize,
    },
  });

  return data;
};
