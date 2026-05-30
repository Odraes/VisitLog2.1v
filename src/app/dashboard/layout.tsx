import { LogoutButton } from "@/components/layout/LogoutButton";

/** Shared shell for all authenticated dashboards. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Fixed in the upper-left across all dashboard views, per spec. */}
      <LogoutButton />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
