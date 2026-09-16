/**
 * User type (basic info, no permissions - we don't need them for list view)
 */
export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_root: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
};

/**
 * User permission - permission assigned to a user
 */
export type UserPermission = {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  granted_at: string;
};
