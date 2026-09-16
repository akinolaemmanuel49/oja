import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionCode } from "@/types/permission";
import type { ReactNode } from "react";

type PermissionGuardProps = {
  /** Single permission code to check */
  permission?: PermissionCode;
  /** Multiple permissions to check (OR logic by default) */
  permissions?: PermissionCode[];
  /** If true, requires ALL permissions instead of ANY */
  requireAll?: boolean;
  /** Content to show when user has permission */
  children: ReactNode;
  /** Content to show when user lacks permission (optional) */
  fallback?: ReactNode;
};

/**
 * PermissionGuard - Conditionally renders children based on user permissions.
 *
 * Shows children if user has required permission(s), otherwise shows fallback or nothing.
 *
 * @example
 * // Single permission check
 * <PermissionGuard permission="users:create">
 *   <Button>Create User</Button>
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions (OR logic - user needs at least one)
 * <PermissionGuard permissions={["users:update", "users:delete"]}>
 *   <Button>Edit User</Button>
 * </PermissionGuard>
 *
 * @example
 * // Multiple permissions (AND logic - user needs all)
 * <PermissionGuard permissions={["users:read", "groups:read"]} requireAll>
 *   <UserGroupManager />
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  // Determine if user has required permission(s)
  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = can(permission);
  } else if (permissions) {
    // Multiple permissions check
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  }

  // Render children if has access, otherwise fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
