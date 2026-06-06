import "@tabler/core/dist/css/tabler.min.css";
import type { Metadata } from "next";

import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Trip",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
