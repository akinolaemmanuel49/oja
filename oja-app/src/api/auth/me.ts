import { AxiosError } from "axios";
import apiClient from "../client";
import type { UserWithPermissions } from "@/types/permission";

export const me = async (): Promise<UserWithPermissions | null> => {
  try {
    const { data } = await apiClient.get<UserWithPermissions>("/auth/me");
    return data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response?.status === 401) {
      return null;
    }

    throw err;
  }
};
