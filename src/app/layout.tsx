import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisitVault — Visitor Log System",
  description: "Register, verify, and track visitors with QR-based access codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
