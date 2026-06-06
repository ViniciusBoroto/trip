"use client";

import { startTransition, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconLock,
  IconMail,
} from "@tabler/icons-react";

import { ApiClientError, getPublicApiBaseUrl } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import type { LoginRequest } from "@/types/auth";

type FormStatus = {
  kind: "idle" | "loading" | "error" | "success";
  message?: string;
};

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: LoginRequest = {
      email: email.trim(),
      password,
      remember,
    };

    if (!payload.email || !payload.password) {
      setStatus({
        kind: "error",
        message: "Email and password are required.",
      });
      return;
    }

    setStatus({ kind: "loading", message: "Authenticating..." });

    try {
      const user = await login(payload);

      setStatus({
        kind: "success",
        message: `Authenticated as ${user.email}. Refresh token cookie issued by ${getPublicApiBaseUrl()}.`,
      });

      startTransition(() => {
        router.replace("/");
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setStatus({
          kind: "error",
          message: error.message,
        });
        return;
      }

      setStatus({
        kind: "error",
        message:
          "Could not reach the API. Set NEXT_PUBLIC_API_BASE_URL to your backend URL.",
      });
    }
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <div className="input-icon">
            <span className="input-icon-addon" aria-hidden="true">
              <IconMail size={18} stroke={1.8} />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status.kind === "loading"}
            />
          </div>
        </div>

        <div className="mb-2">
          <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
            <label htmlFor="password" className="form-label mb-0">
              Password
            </label>
            <Link href="#" className="auth-inline-link">
              Forgot password?
            </Link>
          </div>
          <div className="input-icon">
            <span className="input-icon-addon" aria-hidden="true">
              <IconLock size={18} stroke={1.8} />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={status.kind === "loading"}
            />
          </div>
        </div>

        <label className="form-check mt-3 mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            disabled={status.kind === "loading"}
          />
          <span className="form-check-label">Keep me signed in on this device</span>
        </label>

        <button
          type="submit"
          className="btn btn-primary w-100 auth-submit"
          disabled={status.kind === "loading"}
        >
          <span>{status.kind === "loading" ? "Sending..." : "Log in"}</span>
          <IconArrowRight size={18} stroke={2} />
        </button>
      </form>

      <div
        className={`auth-status auth-status-${status.kind}`}
        role="status"
        aria-live="polite"
      >
        {status.message}
      </div>

    </>
  );
}
