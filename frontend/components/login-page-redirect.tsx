"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export function LoginPageRedirect() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    startTransition(() => {
      router.replace("/");
    });
  }, [router, status]);

  return null;
}
