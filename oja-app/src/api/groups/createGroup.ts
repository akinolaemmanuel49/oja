import type { Group } from "@/types/group";
import apiClient from "../client";
import type { CreateGroupRequest } from "@/requests/group";

export async function createGroup(
  groupData: CreateGroupRequest,
): Promise<Group> {
  const { data } = await apiClient.post("/groups", groupData);

  return data;
}
