import apiClient from "../client";

export const deleteGroup = async (groupId: string) => {
  const { data } = await apiClient.delete(`/groups/${groupId}`);
  return data;
};

type DeleteGroupMutationFnParams = {
  groupId: string;
};

export const DeleteGroupMutationFn = async ({
  groupId,
}: DeleteGroupMutationFnParams) => {
  return deleteGroup(groupId);
};
