import { redirect } from "next/navigation";
import { getUserFromHeaders } from "@/lib/auth/identity";
import { Role } from "@/types/user.types";
import { User } from "@/lib/domain/entities/User";

/**
 * Server-side helper for pages: returns the current domain user, redirecting
 * to sign-in if unauthenticated or to their own dashboard if the role is wrong.
 */
export async function getCurrentUserOrRedirect(
  requiredRole?: Role
): Promise<User> {
  // Identity is verified once in middleware and forwarded via request headers,
  // avoiding a redundant auth.getUser()/DB lookup on every page render.
  const user = getUserFromHeaders();

  if (!user) redirect("/auth/signin");
  if (requiredRole && user.role !== requiredRole) {
    redirect(user.getDashboardPath());
  }
  return user;
}
