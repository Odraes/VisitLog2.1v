import { Profile } from "@prisma/client";
import { Role } from "@/types/user.types";
import { User } from "@/lib/domain/entities/User";
import { AdminUser } from "@/lib/domain/entities/AdminUser";
import { ResidentUser } from "@/lib/domain/entities/ResidentUser";
import { GuardUser } from "@/lib/domain/entities/GuardUser";

/**
 * Factory Pattern: instantiate the correct concrete User subclass based on the
 * persisted role. Callers depend only on the abstract `User` type.
 */
export class UserFactory {
  static create(profile: Profile): User {
    switch (profile.role) {
      case Role.ADMIN:
        return new AdminUser(profile);
      case Role.RESIDENT:
        return new ResidentUser(profile);
      case Role.GUARD:
        return new GuardUser(profile);
      default:
        throw new Error(`UserFactory: unknown role "${profile.role}"`);
    }
  }
}
