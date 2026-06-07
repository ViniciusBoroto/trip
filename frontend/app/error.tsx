"use client";

import Link from "next/link";
import { IconMapPin, IconRefresh, IconArrowLeft } from "@tabler/icons-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  return (
    <main className="page page-center min-h-screen py-5 px-4 d-flex align-items-center justify-content-center">
      <div className="text-center" style={{ maxWidth: 420 }}>
        <div className="mb-4">
          <Link
            href="/login"
            className="navbar-brand navbar-brand-autodark inline-flex items-center gap-3 text-[oklch(0.25_0.02_252)] text-base font-bold no-underline"
          >
            <span
              className="inline-flex items-center justify-center w-9 h-9 rounded-[0.875rem] bg-[oklch(0.58_0.19_256)] text-white shadow-[0_8px_24px_oklch(0.58_0.19_256_/_0.22)]"
              aria-hidden="true"
            >
              <IconMapPin size={18} stroke={2.25} />
            </span>
            <span className="d-none d-sm-inline">Trip</span>
          </Link>
        </div>

        <div className="card card-md border border-[oklch(0.89_0.01_240)] rounded-2xl bg-[oklch(0.995_0_0_/_0.92)] md:shadow-[0_18px_50px_oklch(0.19_0.02_252_/_0.08)]">
          <div className="card-body py-5">
            <p className="text-[oklch(0.47_0.08_250)] text-[0.8125rem] font-bold tracking-wider uppercase mb-3">
              Something went wrong
            </p>
            <h1 className="h2 mb-2 text-body-emphasis">Unexpected error</h1>
            <p className="text-secondary mb-4">
              {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <div className="d-flex flex-column gap-2">
              <button
                onClick={reset}
                className="btn btn-primary w-100 h-12 inline-flex items-center justify-center gap-[0.625rem] bg-[oklch(0.58_0.19_256)] border-[oklch(0.58_0.19_256)] hover:bg-[oklch(0.53_0.19_256)] hover:border-[oklch(0.53_0.19_256)]"
              >
                <IconRefresh size={18} stroke={2} />
                <span>Try again</span>
              </button>
              <Link
                href="/"
                className="btn w-100 h-12 inline-flex items-center justify-center gap-[0.625rem] border-[oklch(0.87_0.013_240)] text-[oklch(0.25_0.02_252)] hover:bg-[oklch(0.96_0.006_245)] no-underline"
              >
                <IconArrowLeft size={18} stroke={2} />
                <span>Back to home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
