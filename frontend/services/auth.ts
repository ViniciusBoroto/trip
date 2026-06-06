import { apiRequest } from "@/lib/api/client";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
