import { useAuth } from "@/hooks/useAuth";
import {
  PermissionContext,
  type PermissionContextType,
} from "@/hooks/usePermissions";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/permissions";
import type { PermissionCode } from "@/types/permission";
import { type ReactNode } from "react";

/**
 * PermissionProvider wraps the app and provides permission checking capabilities.
 * Relies on useAuth to get the current user and their permissions.
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  // Get current user from auth context (updated to expect UserWithPermissions type)
  const { userWithPermissions, isLoading } = useAuth();

  // Cast user to UserWithPermissions if it exists
  const userWithPerms = userWithPermissions;

  // Extract permissions, default to empty array if user not loaded
  const permissions = Array.isArray(userWithPerms?.permissions)
    ? userWithPerms.permissions
    : [];

  const value: PermissionContextType = {
    permissions,
    // Helper: Check single permission
    can: (permission: PermissionCode) => hasPermission(permissions, permission),
    // Helper: Check if user has ANY of the permissions (OR)
    canAny: (perms: PermissionCode[]) => hasAnyPermission(permissions, perms),
    // Helper: Check if user has ALL of the permissions (AND)
    canAll: (perms: PermissionCode[]) => hasAllPermissions(permissions, perms),
    isLoading,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}
