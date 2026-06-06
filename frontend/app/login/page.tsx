import Link from "next/link";
import { IconMapPin } from "@tabler/icons-react";

import { LoginForm } from "@/components/login-form";
import { LoginPageRedirect } from "@/components/login-page-redirect";

export default function LoginPage() {
  return (
    <main className="page page-center auth-shell">
      <LoginPageRedirect />
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <Link href="/login" className="navbar-brand navbar-brand-autodark auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">
              <IconMapPin size={18} stroke={2.25} />
            </span>
            <span>Trip</span>
          </Link>
        </div>

        <div className="card card-md shadow-sm auth-card">
          <div className="card-body">
            <div className="mb-4">
              <p className="auth-kicker mb-2">Start your next trip</p>
              <h1 className="h2 mb-2 text-body-emphasis">Log in to continue</h1>
              <p className="text-secondary mb-0">
                Access saved itineraries, shared plans, and trip updates from one place.
              </p>
            </div>

            <LoginForm />

          </div>
        </div>

        <p className="text-center text-secondary mt-4 mb-0 auth-footnote">
          New here? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
