"use client";

import { startTransition, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
} from "@tabler/icons-react";

import { ApiClientError, getPublicApiBaseUrl } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import type { LoginRequest } from "@/types/auth";
import { AuthInput, AuthButton, AuthStatus } from "@/components/auth-layout";

type FormStatus = {
  kind: "idle" | "loading" | "error" | "success";
  message?: string;
};

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <form onSubmit={handleSubmit}>
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status.kind === "loading"}
          icon={IconMail}
        />

        <AuthInput
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          labelRight={
            <Link
              href="#"
              className="text-[oklch(0.47_0.08_250)] font-semibold no-underline hover:text-[oklch(0.42_0.09_250)] text-sm"
            >
              Forgot password?
            </Link>
          }
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={status.kind === "loading"}
          icon={IconLock}
          suffix={
            <button
              type="button"
              className="input-icon-addon border-0 text-[oklch(0.45_0.02_245)]"
              style={{ pointerEvents: "auto", cursor: "pointer" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={status.kind === "loading"}
            >
              {showPassword ? <IconEyeOff size={18} stroke={1.8} /> : <IconEye size={18} stroke={1.8} />}
            </button>
          }
        />

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

        <AuthButton disabled={status.kind === "loading"}>
          <span>{status.kind === "loading" ? "Sending..." : "Log in"}</span>
          <IconArrowRight size={18} stroke={2} />
        </AuthButton>

        <div className="position-relative text-center my-4">
          <hr className="border-[oklch(0.87_0.013_240)]" />
          <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-[oklch(0.48_0.02_245)] text-sm">
            or
          </span>
        </div>

        <Link
          href="/login-otp"
          className="btn w-100 h-12 inline-flex items-center justify-center gap-3 rounded-[0.875rem] border-2 border-dashed border-[oklch(0.58_0.19_256_/_0.3)] bg-transparent text-[oklch(0.58_0.19_256)] font-semibold no-underline hover:bg-[oklch(0.58_0.19_256_/_0.06)] hover:border-[oklch(0.58_0.19_256_/_0.5)] transition-all"
        >
          <IconMail size={18} stroke={2} />
          <span>Sign in with a one-time code</span>
        </Link>
      </form>

      <AuthStatus kind={status.kind} message={status.message} />
    </>
  );
}
