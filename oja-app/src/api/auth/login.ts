import apiClient from "../client";

export type LoginCredentials = {
  email: string;
  password: string;
};

export const login = async (credentials: LoginCredentials) => {
  const { data } = await apiClient.post("/auth/login", credentials);
  return data;
};
