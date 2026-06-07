import Link from "next/link";
import { OtpForm } from "@/components/otp-form";
import { LoginPageRedirect } from "@/components/login-page-redirect";
import { AuthLayout } from "@/components/auth-layout";

export const metadata = {
  title: "Sign in with email code · Trip",
  description: "Enter your email to receive a one-time sign-in code.",
};

export default function LoginOtpPage() {
  return (
    <>
      <LoginPageRedirect />
      <AuthLayout
        kicker="Passwordless sign-in"
        title="Sign in with a code"
        description="We'll send a 6-digit code to your email. No password needed."
        footnote={
          <>
            Prefer a password?{" "}
            <Link
              href="/login"
              className="text-[oklch(0.47_0.08_250)] font-semibold no-underline hover:text-[oklch(0.42_0.09_250)]"
            >
              Log in instead
            </Link>
          </>
        }
      >
        <OtpForm />
      </AuthLayout>
    </>
  );
}
