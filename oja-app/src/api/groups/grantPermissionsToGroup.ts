import type { GrantPermissionsToGroupResponse } from "@/responses/group";
import apiClient from "../client";

export async function grantPermissionsToGroup(
  groupId: string,
  permissionCodes: string[],
): Promise<GrantPermissionsToGroupResponse> {
  const { data } = await apiClient.post(`/groups/${groupId}/permissions/grant`, {
    permission_codes: permissionCodes,
  });
  return data;
}

type GrantPermissionsToGroupMutationFnParams = {
  groupId: string;
  permissionCodes: string[];
};

export async function grantPermissionsToGroupMutationFn({
  groupId,
  permissionCodes,
}: GrantPermissionsToGroupMutationFnParams) {
  return grantPermissionsToGroup(groupId, permissionCodes);
}
