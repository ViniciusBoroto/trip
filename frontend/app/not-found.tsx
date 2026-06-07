import Link from "next/link";
import { IconMapPin, IconArrowLeft } from "@tabler/icons-react";

export default function NotFoundPage() {
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
              404
            </p>
            <h1 className="h2 mb-2 text-body-emphasis">Page not found</h1>
            <p className="text-secondary mb-4">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link
              href="/"
              className="btn btn-primary w-100 h-12 inline-flex items-center justify-center gap-[0.625rem] bg-[oklch(0.58_0.19_256)] border-[oklch(0.58_0.19_256)] hover:bg-[oklch(0.53_0.19_256)] hover:border-[oklch(0.53_0.19_256)] no-underline"
            >
              <IconArrowLeft size={18} stroke={2} />
              <span>Back to home</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-secondary mt-4 mb-0 text-[0.9375rem]">
          Need help?{" "}
          <Link
            href="/login"
            className="text-[oklch(0.47_0.08_250)] font-semibold no-underline hover:text-[oklch(0.42_0.09_250)]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
