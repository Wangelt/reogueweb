import { api } from "@/lib/api/client";
import type { AuthResponse, AuthTokens } from "@/lib/api/types";

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post<AuthResponse>("/auth/register", data, { auth: false }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }, { auth: false }),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>("/auth/refresh", { refreshToken }, { auth: false }),

  logout: (refreshToken: string) =>
    api.post<void>("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<void>("/auth/forgot-password", { email }, { auth: false }),

  resetPassword: (token: string, password: string) =>
    api.post<void>("/auth/reset-password", { token, password }, { auth: false }),

  verifyEmail: (token: string) =>
    api.post<void>("/auth/verify-email", { token }, { auth: false }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<void>("/auth/change-password", { currentPassword, newPassword }),
};
