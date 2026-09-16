import { Navigate } from "react-router-dom";

import type { PermissionCode } from "@/types/permission";
import { AppHref } from "@/routes/constants";
import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { AppLoader } from "../loaders/AppLoader";

type PermissionRouteProps = {
  /** Single permission required to access route */
  permission?: PermissionCode;
  /** Multiple permissions required to access route */
  permissions?: PermissionCode[];
  /** If true, requires ALL permissions instead of ANY */
  requireAll?: boolean;
  /** Content to render if user has permission */
  children: ReactNode;
};

/**
 * PermissionRoute - Route-level permission guard.
 *
 * Redirects to 403 Forbidden page if user lacks required permission.
 * Use this to protect entire route components.
 *
 * @example
 * <Route path="/users" element={
 *   <PermissionRoute permission="users:read">
 *     <UserListPage />
 *   </PermissionRoute>
 * } />
 */
export function PermissionRoute({
  permission,
  permissions,
  requireAll = false,
  children,
}: PermissionRouteProps) {
  const { can, canAny, canAll, isLoading } = usePermissions();

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AppLoader text={"Checking permissions"} />
      </div>
    );
  }

  // Determine if user has required permission(s)
  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  }

  // Redirect to 403 if no access, otherwise render children
  return hasAccess ? (
    <>{children}</>
  ) : (
    <Navigate to={AppHref.forbiddenRoute} replace />
  );
}
