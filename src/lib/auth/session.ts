import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildAuthService } from "@/lib/container";
import { Role } from "@/types/user.types";
import { User } from "@/lib/domain/entities/User";

/**
 * Server-side helper for pages: returns the current domain user, redirecting
 * to sign-in if unauthenticated or to their own dashboard if the role is wrong.
 */
export async function getCurrentUserOrRedirect(
  requiredRole?: Role
): Promise<User> {
  const supabase = createClient();
  const user = await buildAuthService(supabase).getCurrentUser();

  if (!user) redirect("/auth/signin");
  if (requiredRole && user.role !== requiredRole) {
    redirect(user.getDashboardPath());
  }
  return user;
}
