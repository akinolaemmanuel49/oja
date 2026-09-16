import type { Permission, PermissionCode } from "@/types/permission";
import { createContext, useContext } from "react";

/**
 * Hook to access permission checking in any component.
 * Must be used within PermissionProvider.
 *
 * @example
 * const { can } = usePermissions();
 * if (can('users:create')) {
 *   // Show create user button
 * }
 */

/**
 * Context for permission checking across the app.
 * Provides centralized access to user permissions and checking utilities.
 */
export type PermissionContextType = {
  permissions: Permission[] | string[];
  can: (permission: PermissionCode) => boolean;
  canAny: (permissions: PermissionCode[]) => boolean;
  canAll: (permissions: PermissionCode[]) => boolean;
  isLoading: boolean;
};

export const PermissionContext = createContext<
  PermissionContextType | undefined
>(undefined);

export function usePermissions() {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error("usePermissions must be used within PermissionProvider");
  }

  return context;
}
