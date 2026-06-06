import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { LoginPageRedirect } from "@/components/login-page-redirect";
import { AuthLayout } from "@/components/auth-layout";

export default function LoginPage() {
  return (
    <>
      <LoginPageRedirect />
      <AuthLayout
        kicker="Start your next trip"
        title="Log in to continue"
        description="Access saved itineraries, shared plans, and trip updates from one place."
        footnote={
          <>
            New here?{" "}
            <Link
              href="/register"
              className="text-[oklch(0.47_0.08_250)] font-semibold no-underline hover:text-[oklch(0.42_0.09_250)]"
            >
              Create an account
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthLayout>
    </>
  );
}
