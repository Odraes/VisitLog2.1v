import { User } from "./User";
import { Action, Permission } from "@/types/user.types";

/** Admins have unrestricted access: full CRUD over every visitor record. */
export class AdminUser extends User {
  getPermissions(): Permission[] {
    return [
      Permission.READ_ALL,
      Permission.CREATE,
      Permission.UPDATE,
      Permission.DELETE,
    ];
  }

  getDashboardPath(): string {
    return "/dashboard/admin";
  }

  canPerform(_action: Action): boolean {
    // An admin may perform any action in the system.
    return true;
  }
}
