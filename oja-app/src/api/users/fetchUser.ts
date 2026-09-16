import type { QueryFunctionContext } from "@tanstack/react-query";
import apiClient from "../client";
import type { User } from "@/types/user";

export const fetchUser = async (
  ctx: QueryFunctionContext<[string, string]>,
): Promise<User> => {
  const [, userId] = ctx.queryKey;
  const { data } = await apiClient.get<User>(`/users/${userId}`);

  return data;
};
