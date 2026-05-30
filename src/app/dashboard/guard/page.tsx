import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { GuardConsole } from "@/components/guard/GuardConsole";
import { getCurrentUserOrRedirect } from "@/lib/auth/session";
import { Role } from "@/types/user.types";

export default async function GuardDashboard() {
  const user = await getCurrentUserOrRedirect(Role.GUARD);

  return (
    <div>
      <DashboardHeader
        title="Guard Dashboard"
        subtitle="Scan a QR code or enter an access code to verify a visitor."
        userName={user.fullName}
      />
      <GuardConsole />
    </div>
  );
}
