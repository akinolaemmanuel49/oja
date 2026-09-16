import apiClient from "../client";

export const addUserToGroup = async (userId: string, groupId: string) => {
  const { data } = await apiClient.post(`/users/${userId}/groups/add`, {
    group_id: groupId,
  });

  return data;
};

type AddUserToGroupMutationFnParams = {
  userId: string;
  groupId: string;
};

export const addUserToGroupMutationFn = async ({
  userId,
  groupId,
}: AddUserToGroupMutationFnParams) => {
  return addUserToGroup(userId, groupId);
};
