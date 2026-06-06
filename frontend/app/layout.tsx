import '@tabler/core/dist/css/tabler.min.css';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js + Tabler UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
