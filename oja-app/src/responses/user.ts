export type RevokePermissionsFromUserResponse = {
  message: string;
  revoked_count: number;
  requested_count: number;
  not_present: number;
};

export type GrantPermissionsToUserResponse = {
  message: string;
  granted_count: number;
  requested_count: number;
  already_had: number;
};
