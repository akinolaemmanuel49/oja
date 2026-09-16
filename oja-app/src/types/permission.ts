import type { User } from "./user";

/**
 * Permission represents an atomic access right in the system.
 * Format: "resource:action" or "*" for superuser
 * Examples: "users:read", "products:create", "storefronts:*"
 */
export type Permission = {
  id: string;
  code: string; // e.g., "users:read", "*"
  name: string;
  resource: string; // e.g., "users", "products", "*"
  action: string; // e.g., "read", "create", "update", "delete", "*"
  description?: string;
};

/**
 * PermissionCheck - utility type for permission checking
 */
export type PermissionCode = string; // e.g., "users:read", "products:*"

/**
 * Extended User type that includes permissions
 */
export type UserWithPermissions = {
  user: User;
  permissions: string[];
};
