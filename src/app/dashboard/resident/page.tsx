import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { VisitorRegistrationForm } from "@/components/resident/VisitorRegistrationForm";
import { getCurrentUserOrRedirect } from "@/lib/auth/session";
import { ResidentUser } from "@/lib/domain/entities/ResidentUser";
import { Role } from "@/types/user.types";

export default async function ResidentDashboard() {
  const user = await getCurrentUserOrRedirect(Role.RESIDENT);
  const unit = user instanceof ResidentUser ? user.unitNumber : null;

  return (
    <div>
      <DashboardHeader
        title="Resident Dashboard"
        subtitle="Register a visitor to generate their access code and QR pass."
        userName={user.fullName}
      />
      <div className="mx-auto max-w-xl">
        <VisitorRegistrationForm defaultUnit={unit} />
      </div>
    </div>
  );
}
