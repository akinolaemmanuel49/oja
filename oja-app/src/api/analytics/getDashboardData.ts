import { AxiosError } from "axios";
import apiClient from "../client";
import type { DashboardData } from "@/types/analytics";

export const getDashboardData = async (): Promise<DashboardData | null> => {
  try {
    const { data } = await apiClient.get<DashboardData>("/analytics/dashboard");
    return data;
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response?.status === 401) {
      return null;
    }

    throw err;
  }
};
