"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import type { MeResponse } from "@/types/auth";

type MeCheckState = {
  kind: "idle" | "loading" | "error" | "success";
  message?: string;
};

export default function Home() {
  const router = useRouter();
  const { status, user, logout, authenticatedRequest } = useAuth();
  const [meCheck, setMeCheck] = useState<MeCheckState>({ kind: "idle" });

  useEffect(() => {
    if (status !== "anonymous") {
      return;
    }

    startTransition(() => {
      router.replace("/login");
    });
  }, [router, status]);

  async function handleVerifySession() {
    setMeCheck({ kind: "loading", message: "Calling /auth/me with bearer token..." });

    try {
      const response = await authenticatedRequest<MeResponse>("/auth/me");

      if (!response?.ok) {
        setMeCheck({
          kind: "error",
          message: response?.message || "Session verification failed.",
        });
        return;
      }

      setMeCheck({
        kind: "success",
        message: `Authenticated as ${response.user.email}.`,
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setMeCheck({ kind: "error", message: error.message });
        return;
      }

      setMeCheck({ kind: "error", message: "Unexpected auth failure." });
    }
  }

  async function handleLogout() {
    await logout();
    startTransition(() => {
      router.replace("/login");
    });
  }

  if (status === "loading") {
    return <main className="container py-6">Checking session...</main>;
  }

  if (status === "anonymous") {
    return null;
  }

  return (
    <main className="container py-6">
      <div className="card">
        <div className="card-body d-flex flex-column gap-4">
          <div>
            <p className="text-secondary text-uppercase mb-2">Authenticated session</p>
            <h1 className="h2 mb-2">Welcome back{user ? `, ${user.name}` : ""}</h1>
            <p className="text-secondary mb-0">
              The access token lives in frontend memory. Reloading the page forces a refresh-token cookie roundtrip.
            </p>
          </div>

          <div>
            <div><strong>User ID:</strong> {user?.id}</div>
            <div><strong>Email:</strong> {user?.email}</div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-primary" onClick={handleVerifySession}>
              Verify with /auth/me
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>

          <div className={`auth-status auth-status-${meCheck.kind}`} role="status" aria-live="polite">
            {meCheck.message || "Protected requests will auto-refresh once on 401."}
          </div>
        </div>
      </div>
    </main>
  );
}
