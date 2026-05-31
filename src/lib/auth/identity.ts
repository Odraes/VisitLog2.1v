import { headers } from "next/headers";
import { Profile, Role } from "@prisma/client";
import { UserFactory } from "@/lib/domain/factories/UserFactory";
import { User } from "@/lib/domain/entities/User";

const VALID_ROLES = new Set<string>([Role.ADMIN, Role.RESIDENT, Role.GUARD]);

/**
 * Rebuilds the domain User from the `x-user-*` identity headers that
 * `middleware.ts` sets after verifying the session. This avoids a second
 * `auth.getUser()` network round-trip plus the Profile DB lookup on every
 * protected request. Returns null when the request carries no verified
 * identity (i.e. the caller is unauthenticated).
 *
 * Safe to trust: middleware always strips any client-supplied `x-user-*`
 * headers and re-sets them from the verified user, so they cannot be spoofed.
 */
export function getUserFromHeaders(): User | null {
  const h = headers();
  const id = h.get("x-user-id");
  const role = h.get("x-user-role");
  if (!id || !role || !VALID_ROLES.has(role)) return null;

  const timestamp = h.get("x-user-created");
  const createdAt = timestamp ? new Date(timestamp) : new Date();

  const profile: Profile = {
    id,
    email: h.get("x-user-email") ?? "",
    fullName: h.get("x-user-name") ?? "",
    role: role as Role,
    unitNumber: h.get("x-user-unit") || null,
    createdAt,
    updatedAt: createdAt,
  };

  return UserFactory.create(profile);
}
