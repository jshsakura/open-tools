import type { Metadata } from "next";
import "./globals.css";

// This layout is required for the root route, even if we redirect
export const metadata: Metadata = {
  title: "Open Tools Platform",
  description: "A premium collection of developer tools and utilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
