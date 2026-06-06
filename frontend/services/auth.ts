import { apiRequest } from "@/lib/api/client";
import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";

export async function register(payload: RegisterRequest) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshSession() {
  return apiRequest<RefreshResponse>("/auth/refresh", {
    method: "POST",
  });
}

export async function logout() {
  return apiRequest<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser(accessToken: string) {
  return apiRequest<MeResponse>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
