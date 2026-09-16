import type { GrantPermissionsToUserResponse } from "@/responses/user";
import apiClient from "../client";

export async function grantPermissionsToUser(
  userId: string,
  permissionCodes: string[],
): Promise<GrantPermissionsToUserResponse> {
  const { data } = await apiClient.post(`/users/${userId}/permissions/grant`, {
    permission_codes: permissionCodes,
  });
  return data;
}

type GrantPermissionsToUserMutationFnParams = {
  userId: string;
  permissionCodes: string[];
};

export async function grantPermissionsToUserMutationFn({
  userId,
  permissionCodes,
}: GrantPermissionsToUserMutationFnParams) {
  return grantPermissionsToUser(userId, permissionCodes);
}
