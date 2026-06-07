"use client";

import type { ComponentType, InputHTMLAttributes, ReactNode, Ref } from "react";
import { forwardRef } from "react";
import Link from "next/link";
import { IconMapPin } from "@tabler/icons-react";

// --- AUTH INPUT COMPONENT ---
type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  labelRight?: ReactNode;
  icon: ComponentType<{ size?: number; stroke?: number }>;
  suffix?: ReactNode;
};

export const AuthInput = forwardRef(function AuthInput(
  {
    id,
    label,
    labelRight,
    icon: Icon,
    suffix,
    className = "",
    ...props
  }: AuthInputProps,
  ref: Ref<HTMLInputElement>,
) {
  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
        <label htmlFor={id} className="form-label mb-0">
          {label}
        </label>
        {labelRight}
      </div>
      <div className="input-icon relative">
        <span className="input-icon-addon text-[oklch(0.45_0.02_245)]" aria-hidden="true">
          <Icon size={18} stroke={1.8} />
        </span>
        <input
          id={id}
          ref={ref}
          className={`form-control h-12 border-[oklch(0.87_0.013_240)] rounded-[0.875rem] bg-white text-[oklch(0.22_0.02_252)] placeholder-[oklch(0.48_0.02_245)] focus:border-[oklch(0.58_0.19_256_/_0.75)] focus:shadow-[0_0_0_0.2rem_oklch(0.58_0.19_256_/_0.14)] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {suffix}
      </div>
    </div>
  );
});

// --- AUTH BUTTON COMPONENT ---
type AuthButtonProps = {
  type?: "submit" | "button";
  disabled?: boolean;
  children: ReactNode;
};

export function AuthButton({ type = "submit", disabled, children }: AuthButtonProps) {
  return (
    <button
      type={type}
      className="btn btn-primary w-100 h-12 inline-flex items-center justify-center gap-[0.625rem] bg-[oklch(0.58_0.19_256)] border-[oklch(0.58_0.19_256)] hover:bg-[oklch(0.53_0.19_256)] hover:border-[oklch(0.53_0.19_256)] focus:bg-[oklch(0.53_0.19_256)] focus:border-[oklch(0.53_0.19_256)] disabled:bg-[oklch(0.72_0.07_255)] disabled:border-[oklch(0.72_0.07_255)]"
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// --- AUTH STATUS COMPONENT ---
type AuthStatusProps = {
  kind: "idle" | "loading" | "error" | "success";
  message?: string;
};

const STATUS_CLASSES = {
  idle: "bg-[oklch(0.96_0.006_245)] text-[oklch(0.34_0.02_248)]",
  loading: "bg-[oklch(0.95_0.03_240)] text-[oklch(0.32_0.04_244)]",
  error: "bg-[oklch(0.95_0.03_20)] text-[oklch(0.44_0.13_24)]",
  success: "bg-[oklch(0.96_0.03_155)] text-[oklch(0.36_0.11_155)]",
};

export function AuthStatus({ kind, message }: AuthStatusProps) {
  if (!message) return null;
  return (
    <div
      className={`mt-4 rounded-[0.875rem] p-[0.875rem_1rem] text-[0.9375rem] leading-normal ${STATUS_CLASSES[kind]}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

// --- AUTH LAYOUT COMPONENT ---
type AuthLayoutProps = {
  kicker: string;
  title: string;
  description: string;
  footnote: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ kicker, title, description, footnote, children }: AuthLayoutProps) {
  return (
    <main className="page page-center min-h-screen py-5 px-4 md:p-8">
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <Link href="/login" className="navbar-brand navbar-brand-autodark inline-flex items-center gap-3 text-[oklch(0.25_0.02_252)] text-base font-bold no-underline">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-[0.875rem] bg-[oklch(0.58_0.19_256)] text-white shadow-[0_8px_24px_oklch(0.58_0.19_256_/_0.22)]" aria-hidden="true">
              <IconMapPin size={18} stroke={2.25} />
            </span>
            <span>Trip</span>
          </Link>
        </div>

        <div className="card card-md border border-[oklch(0.89_0.01_240)] rounded-2xl bg-[oklch(0.995_0_0_/_0.92)] md:shadow-[0_18px_50px_oklch(0.19_0.02_252_/_0.08)]">
          <div className="card-body">
            <div className="mb-4">
              <p className="text-[oklch(0.47_0.08_250)] text-[0.8125rem] font-bold tracking-wider uppercase mb-2">
                {kicker}
              </p>
              <h1 className="h2 mb-2 text-body-emphasis">{title}</h1>
              <p className="text-secondary mb-0">
                {description}
              </p>
            </div>

            {children}
          </div>
        </div>

        <p className="text-center text-secondary mt-4 mb-0 text-[0.9375rem]">
          {footnote}
        </p>
      </div>
    </main>
  );
}
