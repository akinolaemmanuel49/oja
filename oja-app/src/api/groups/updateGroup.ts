import type { Group } from "@/types/group";
import apiClient from "../client";
import type { UpdateGroupRequest } from "@/requests/group";

export async function updateGroup(
  groupId: string,
  groupUpdate: UpdateGroupRequest,
): Promise<Group> {
  const { data } = await apiClient.patch(`/groups/${groupId}`, groupUpdate);
  return data;
}

type UpdateGroupMutationFnParams = {
  groupId: string;
  groupUpdate: UpdateGroupRequest;
};

export async function updateGroupMutationFn({
  groupId,
  groupUpdate,
}: UpdateGroupMutationFnParams) {
  return updateGroup(groupId, groupUpdate);
}
