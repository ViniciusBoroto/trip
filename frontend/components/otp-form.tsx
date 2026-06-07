"use client";

import { startTransition, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconMail,
  IconShieldCheck,
} from "@tabler/icons-react";

import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/components/auth-provider";
import { sendOtp } from "@/services/auth";
import { AuthInput, AuthButton, AuthStatus } from "@/components/auth-layout";

type Step = "email" | "code";

type FormStatus = {
  kind: "idle" | "loading" | "error" | "success";
  message?: string;
};

export function OtpForm() {
  const router = useRouter();
  const { verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const codeInputRef = useRef<HTMLInputElement>(null);

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus({ kind: "error", message: "Email is required." });
      return;
    }

    setStatus({ kind: "loading", message: "Sending code..." });

    try {
      const response = await sendOtp({ email: trimmedEmail });

      if (!response?.ok) {
        setStatus({
          kind: "error",
          message: (response as { message?: string })?.message ?? "Could not send code.",
        });
        return;
      }

      setStatus({ kind: "success", message: "Code sent! Check your inbox." });
      setStep("code");
      setTimeout(() => codeInputRef.current?.focus(), 50);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setStatus({ kind: "error", message: error.message });
        return;
      }
      setStatus({
        kind: "error",
        message: "Could not reach the API. Check NEXT_PUBLIC_API_BASE_URL.",
      });
    }
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCode = code.trim();

    if (!trimmedCode || !/^\d{6}$/.test(trimmedCode)) {
      setStatus({ kind: "error", message: "Enter the 6-digit code from your email." });
      return;
    }

    setStatus({ kind: "loading", message: "Verifying..." });

    try {
      await verifyOtp({ email: email.trim(), code: trimmedCode, remember });

      setStatus({ kind: "success", message: "Signed in!" });
      startTransition(() => {
        router.replace("/");
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        setStatus({ kind: "error", message: error.message });
        return;
      }
      setStatus({
        kind: "error",
        message: "Could not reach the API. Check NEXT_PUBLIC_API_BASE_URL.",
      });
    }
  }

  if (step === "code") {
    return (
      <>
        <form onSubmit={handleVerifyCode}>
          {/* Email display (read-only) */}
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
              <label className="form-label mb-0">Email</label>
              <button
                type="button"
                className="text-[oklch(0.47_0.08_250)] font-semibold text-sm no-underline hover:text-[oklch(0.42_0.09_250)] bg-transparent border-0 p-0 cursor-pointer"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setStatus({ kind: "idle" });
                }}
              >
                Change
              </button>
            </div>
            <div className="input-icon relative">
              <span className="input-icon-addon text-[oklch(0.45_0.02_245)]" aria-hidden="true">
                <IconMail size={18} stroke={1.8} />
              </span>
              <input
                type="email"
                className="form-control h-12 border-[oklch(0.87_0.013_240)] rounded-[0.875rem] bg-[oklch(0.97_0.004_245)] text-[oklch(0.22_0.02_252)]"
                value={email}
                readOnly
                aria-label="Email address (read-only)"
              />
            </div>
          </div>

          <AuthInput
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            label="Sign-in code"
            labelRight={
              <span className="text-secondary text-sm">6-digit code</span>
            }
            placeholder="000000"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={status.kind === "loading"}
            icon={IconShieldCheck}
            ref={codeInputRef}
          />

          <label className="form-check mt-3 mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={status.kind === "loading"}
            />
            <span className="form-check-label">Keep me signed in on this device</span>
          </label>

          <AuthButton disabled={status.kind === "loading"}>
            <span>{status.kind === "loading" ? "Verifying..." : "Verify & sign in"}</span>
            <IconArrowRight size={18} stroke={2} />
          </AuthButton>
        </form>

        <AuthStatus kind={status.kind} message={status.message} />

        <p className="text-center text-secondary mt-3 mb-0 text-sm">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            className="text-[oklch(0.47_0.08_250)] font-semibold no-underline hover:text-[oklch(0.42_0.09_250)] bg-transparent border-0 p-0 cursor-pointer text-sm"
            onClick={() => {
              setStep("email");
              setCode("");
              setStatus({ kind: "idle" });
            }}
          >
            Resend code
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleSendCode}>
        <AuthInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status.kind === "loading"}
          icon={IconMail}
        />

        <div className="mt-3 mb-4" />

        <AuthButton disabled={status.kind === "loading"}>
          <span>{status.kind === "loading" ? "Sending..." : "Send sign-in code"}</span>
          <IconArrowRight size={18} stroke={2} />
        </AuthButton>
      </form>

      <AuthStatus kind={status.kind} message={status.message} />
    </>
  );
}
