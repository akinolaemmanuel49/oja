/**
 * Group type - represents a collection of users with shared permissions
 */
export type Group = {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

/**
 * Group with additional metadata (member and permission counts)
 */
export type GroupDetail = {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  member_count: number;
  permission_count: number;
  created_at: string;
  updated_at: string;
};

/**
 * Group member - user who belongs to a group
 */
export type GroupMember = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  added_at: string;
};

/**
 * Group permission - permission assigned to a group
 */
export type GroupPermission = {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  granted_at: string;
};
