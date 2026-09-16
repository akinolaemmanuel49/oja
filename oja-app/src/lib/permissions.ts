/**
 * Permission utility functions
 */

import type { Permission, PermissionCode } from "@/types/permission";

/**
 * Check if a permission code matches a required permission.
 * Supports wildcard matching:
 * - "*" matches everything (superuser)
 * - "users:*" matches any action on users resource
 * - "users:read" matches exact permission
 */
export function hasPermission(
  userPermissions: (Permission | string)[],
  requiredPermission: PermissionCode,
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;

  if (!requiredPermission.includes(":")) return false;

  const [requiredResource, requiredAction] = requiredPermission.split(":");

  return userPermissions.some((perm) => {
    const code = typeof perm === "string" ? perm : perm.code;

    if (!code) return false;

    // Superuser wildcard
    if (code === "*") return true;

    // Exact match
    if (code === requiredPermission) return true;

    // Resource wildcard match
    const [resource, action] = code.split(":");

    if (resource === requiredResource && action === "*") {
      return true;
    }

    // Exact structured match
    if (resource === requiredResource && action === requiredAction) {
      return true;
    }

    return false;
  });
}

/**
 * Check if user has ANY of the provided permissions (OR logic)
 */
export function hasAnyPermission(
  userPermissions: (Permission | string)[],
  requiredPermissions: PermissionCode[],
) {
  return requiredPermissions.some((perm) =>
    hasPermission(userPermissions, perm),
  );
}

/**
 * Check if user has ALL of the provided permissions (AND logic)
 */
export function hasAllPermissions(
  userPermissions: (Permission | string)[],
  requiredPermissions: PermissionCode[],
) {
  return requiredPermissions.every((perm) =>
    hasPermission(userPermissions, perm),
  );
}

/**
 * Extract permission codes as a simple string array
 * Useful for debugging or display
 */
export function getPermissionCodes(permissions: Permission[]): string[] {
  return permissions.map((p) => p?.code).filter(Boolean) as string[];
}

/**
 * Group permissions by resource for display
 * Returns: { users: ['create', 'read', 'update'], products: ['read'] }
 */
export function groupPermissionsByResource(
  permissions: Permission[],
): Record<string, string[]> {
  return permissions.reduce(
    (acc, permission) => {
      const code = permission?.code;

      if (!code || !code.includes(":")) return acc;

      const [resource, action] = code.split(":");

      if (!acc[resource]) {
        acc[resource] = [];
      }

      acc[resource].push(action);

      return acc;
    },
    {} as Record<string, string[]>,
  );
}
