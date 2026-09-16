import apiClient from "../client";

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};
