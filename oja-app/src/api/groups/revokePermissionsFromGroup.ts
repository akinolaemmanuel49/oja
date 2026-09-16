import type { RevokePermissionsFromGroupResponse } from "@/responses/group";
import apiClient from "../client";

export async function revokePermissionsFromGroup(
  groupId: string,
  permissionCodes: string[],
): Promise<RevokePermissionsFromGroupResponse> {
  const { data } = await apiClient.post(`/groups/${groupId}/permissions/revoke`, {
    permission_codes: permissionCodes,
  });
  return data;
}

type RevokePermissionsFromGroupMutationFnParams = {
  groupId: string;
  permissionCodes: string[];
};

export async function revokePermissionsFromGroupMutationFn({
  groupId,
  permissionCodes,
}: RevokePermissionsFromGroupMutationFnParams) {
  return revokePermissionsFromGroup(groupId, permissionCodes);
}
