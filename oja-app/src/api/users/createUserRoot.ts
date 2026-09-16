import type { CreateUserRequest } from "@/requests/user";
import apiClient from "../client";

export const createUserRoot = async (data: CreateUserRequest) => {
  const { data: response } = await apiClient.post("/users/root", data);
  return response;
};
