export type AddUsersToGroupResponse = {
  message: string;
  added: string[];
  skipped: string[];
  invalid: string[];
};

export type RevokePermissionsFromGroupResponse = {
  message: string;
  revoked_count: number;
  requested_count: number;
  not_present: number;
};

export type RemoveUsersFromGroupResponse = {
  message: string;
  removed: string[];
  not_found: string[];
};

export type GrantPermissionsToGroupResponse = {
  message: string;
  granted_count: number;
  requested_count: number;
  already_had: number;
};
