import type { Permission } from "@/types/permission";
import apiClient from "../client";

export async function listAllPermissions(): Promise<Permission[]> {
  const { data } = await apiClient.get(`/permissions/list`);

  return data;
}
