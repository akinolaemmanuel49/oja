import type { UpdateUserRequest } from "@/requests/user";
import apiClient from "../client";
import type { User } from "@/types/user";

export const updateUser = async (
  userId: string,
  userUpdate: UpdateUserRequest,
): Promise<User> => {
  const { data } = await apiClient.patch(`/users/${userId}`, userUpdate);
  return data;
};

type UpdateUserMutationFnParams = {
  userId: string;
  userUpdate: UpdateUserRequest;
};

export async function updateUserMutationFn({
  userId,
  userUpdate,
}: UpdateUserMutationFnParams) {
  return updateUser(userId, userUpdate);
}
