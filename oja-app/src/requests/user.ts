/**
 * Request data for creating a user
 */
export type CreateUserRequest = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

/**
 * Request data for updating a user
 */
export type UpdateUserRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
};
