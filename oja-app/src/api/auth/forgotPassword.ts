import apiClient from "../client";

export const forgotPassword = async (email: string) => {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
};