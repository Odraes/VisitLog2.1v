import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle";

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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <DarkModeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
