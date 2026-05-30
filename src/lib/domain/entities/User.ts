import { Profile } from "@prisma/client";
import { Action, Permission, Role, UserProfile } from "@/types/user.types";

/**
 * Abstract base class for all users. Encapsulates the shared identity fields
 * as private members exposed through getters. Role-specific behavior is
 * deferred to subclasses via abstract methods (polymorphism).
 */
export abstract class User {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _fullName: string;
  private readonly _role: Role;
  private readonly _createdAt: Date;

  constructor(profile: Profile) {
    this._id = profile.id;
    this._email = profile.email;
    this._fullName = profile.fullName;
    this._role = profile.role;
    this._createdAt = profile.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get fullName(): string {
    return this._fullName;
  }

  get role(): Role {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /** Permissions granted to this role. */
  abstract getPermissions(): Permission[];

  /** Dashboard landing path for this role. */
  abstract getDashboardPath(): string;

  /** Whether this role may perform the given action. */
  abstract canPerform(action: Action): boolean;

  /** Serializable representation safe to send to the client. */
  toJSON(): UserProfile {
    return {
      id: this._id,
      email: this._email,
      fullName: this._fullName,
      role: this._role,
      createdAt: this._createdAt.toISOString(),
      dashboardPath: this.getDashboardPath(),
    };
  }
}
