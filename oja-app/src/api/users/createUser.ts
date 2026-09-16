import type { CreateUserRequest } from "@/requests/user";
import apiClient from "../client";

export const createUser = async (data: CreateUserRequest) => {
  const { data: response } = await apiClient.post("/users", data);
  return response;
};
