import Link from "next/link";
import { LoginPageRedirect } from "@/components/login-page-redirect";
import { RegisterForm } from "@/components/register-form";
import { AuthLayout } from "@/components/auth-layout";

export default function RegisterPage() {
  return (
    <>
      <LoginPageRedirect />
      <AuthLayout
        kicker="Create your Trip account"
        title="Start planning with a real account"
        description="Sign up once, get a refresh cookie, and keep your trip data tied to an actual user."
        footnote={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[oklch(0.47_0.08_250)] font-semibold no-underline hover:text-[oklch(0.42_0.09_250)]"
            >
              Log in
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthLayout>
    </>
  );
}
