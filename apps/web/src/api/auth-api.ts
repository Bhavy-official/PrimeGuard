import type { ApiResponse } from "../types/api";
import type { AuthPayload, AuthUser, LoginInput, RegisterInput } from "../types/auth";
import { apiClient } from "./client";

export const authApi = {
  async register(payload: RegisterInput) {
    const response = await apiClient.post<ApiResponse<AuthPayload>>("/auth/register", payload);
    return response.data;
  },

  async login(payload: LoginInput) {
    const response = await apiClient.post<ApiResponse<AuthPayload>>("/auth/login", payload);
    return response.data;
  },

  async logout() {
    const response = await apiClient.post<ApiResponse<undefined>>("/auth/logout", {});
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/users/me");
    return response.data;
  },
};
