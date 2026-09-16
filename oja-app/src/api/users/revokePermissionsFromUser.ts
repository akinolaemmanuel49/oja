import apiClient from "../client";
import type { RevokePermissionsFromUserResponse } from "@/responses/user";

export async function revokePermissionsFromUser(
  userId: string,
  permissionCodes: string[],
): Promise<RevokePermissionsFromUserResponse> {
  const { data } = await apiClient.post(`/users/${userId}/permissions/revoke`, {
    permission_codes: permissionCodes,
  });
  return data;
}

type RevokePermissionsFromUserMutationFnParams = {
  userId: string;
  permissionCodes: string[];
};

export async function revokePermissionsFromUserMutationFn({
  userId,
  permissionCodes,
}: RevokePermissionsFromUserMutationFnParams) {
  return revokePermissionsFromUser(userId, permissionCodes);
}
