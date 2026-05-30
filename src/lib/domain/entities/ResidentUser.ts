import { Profile } from "@prisma/client";
import { User } from "./User";
import { Action, Permission, UserProfile } from "@/types/user.types";

/**
 * Residents (unit owners) can register visitors and view only their own
 * registered visitors. They carry a unit number.
 */
export class ResidentUser extends User {
  private readonly _unitNumber: string | null;

  constructor(profile: Profile) {
    super(profile);
    this._unitNumber = profile.unitNumber;
  }

  get unitNumber(): string | null {
    return this._unitNumber;
  }

  getPermissions(): Permission[] {
    return [Permission.CREATE, Permission.READ_OWN];
  }

  getDashboardPath(): string {
    return "/dashboard/resident";
  }

  canPerform(action: Action): boolean {
    return [Action.REGISTER_VISITOR, Action.VIEW_OWN_VISITORS].includes(action);
  }

  toJSON(): UserProfile {
    return { ...super.toJSON(), unitNumber: this._unitNumber };
  }
}
