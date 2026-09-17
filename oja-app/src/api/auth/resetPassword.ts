import apiClient from "../client";

export type ResetPasswordPayload = {
  email: string;
  code: string;
  new_password: string;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await apiClient.post("/auth/reset-password", payload);
  return data;
};