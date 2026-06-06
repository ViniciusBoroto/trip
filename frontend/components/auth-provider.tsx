"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";

import { ApiClientError } from "@/lib/api/client";
import {
  authenticatedRequest as runAuthenticatedRequest,
  clearAccessToken,
  refreshAccessToken,
  writeAccessToken,
} from "@/lib/auth/session";
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from "@/services/auth";
import type { AuthUser, LoginRequest, MeResponse } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  authenticatedRequest: <T>(path: string, options?: Parameters<typeof runAuthenticatedRequest>[1]) => Promise<T | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      try {
        const token = await refreshAccessToken();
        const response = await getCurrentUser(token);

        if (!response?.ok) {
          throw new ApiClientError(response?.message || "Could not load current user.", 401, response);
        }

        if (!active) {
          return;
        }

        writeAccessToken(token);
        setUser(response.user);
        setStatus("authenticated");
      } catch {
        if (!active) {
          return;
        }

        clearAccessToken();
        setUser(null);
        setStatus("anonymous");
      }
    }

    void bootstrapSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(payload: LoginRequest) {
    const response = await loginRequest(payload);

    if (!response?.ok || !response.accessToken) {
      throw new ApiClientError(response?.message || "Authentication failed.", 401, response);
    }

    writeAccessToken(response.accessToken);
    setUser(response.user);
    setStatus("authenticated");
    return response.user;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearAccessToken();
      setUser(null);
      setStatus("anonymous");
    }
  }

  async function authenticatedRequest<T>(
    path: string,
    options?: Parameters<typeof runAuthenticatedRequest>[1],
  ): Promise<T | null> {
    try {
      const response = await runAuthenticatedRequest<T>(path, options);

      if (path === "/auth/me") {
        const me = response as MeResponse | null;

        if (me?.ok) {
          setUser(me.user);
        }
      }

      return response;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearAccessToken();
        setUser(null);
        setStatus("anonymous");
      }

      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        login,
        logout,
        authenticatedRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = use(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
