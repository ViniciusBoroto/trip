import Link from "next/link";
import { IconMapPin } from "@tabler/icons-react";

import { LoginPageRedirect } from "@/components/login-page-redirect";
import { RegisterForm } from "@/components/register-form";

const trustPoints = [
  "Account created directly in the auth database",
  "Refresh cookie handled by the browser",
  "Short-lived access token kept in frontend memory",
];

export default function RegisterPage() {
  return (
    <main className="page page-center auth-shell">
      <LoginPageRedirect />
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <Link href="/register" className="navbar-brand navbar-brand-autodark auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">
              <IconMapPin size={18} stroke={2.25} />
            </span>
            <span>Trip</span>
          </Link>
        </div>

        <div className="card card-md shadow-sm auth-card">
          <div className="card-body">
            <div className="mb-4">
              <p className="auth-kicker mb-2">Create your Trip account</p>
              <h1 className="h2 mb-2 text-body-emphasis">Start planning with a real account</h1>
              <p className="text-secondary mb-0">
                Sign up once, get a refresh cookie, and keep your trip data tied to an actual user.
              </p>
            </div>

            <RegisterForm />

            <ul className="auth-points list-unstyled mb-0 mt-4">
              {trustPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-secondary mt-4 mb-0 auth-footnote">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
