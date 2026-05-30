import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { VisitorTable } from "@/components/admin/VisitorTable";
import { getCurrentUserOrRedirect } from "@/lib/auth/session";
import { Role } from "@/types/user.types";

export default async function AdminDashboard() {
  const user = await getCurrentUserOrRedirect(Role.ADMIN);

  return (
    <div>
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Search, edit, and delete any visitor record."
        userName={user.fullName}
      />
      <VisitorTable />
    </div>
  );
}
