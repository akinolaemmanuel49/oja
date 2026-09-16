/**
 * Request data for creating a group
 */
export type CreateGroupRequest = {
  name: string;
  description?: string;
};

/**
 * Request data for updating a group
 */
export type UpdateGroupRequest = {
  name: string;
  description?: string;
};
