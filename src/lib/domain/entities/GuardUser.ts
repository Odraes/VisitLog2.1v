import { User } from "./User";
import { Action, Permission } from "@/types/user.types";

/**
 * Guards verify visitors at the gate: look up codes, view visitor info,
 * and log time-in / time-out. They cannot create, edit, or delete records.
 */
export class GuardUser extends User {
  getPermissions(): Permission[] {
    return [
      Permission.READ_ALL,
      Permission.LOG_TIMEIN,
      Permission.LOG_TIMEOUT,
    ];
  }

  getDashboardPath(): string {
    return "/dashboard/guard";
  }

  canPerform(action: Action): boolean {
    return [
      Action.SCAN_QR,
      Action.LOOKUP_VISITOR,
      Action.VIEW_ALL_VISITORS,
      Action.LOG_TIMEIN,
      Action.LOG_TIMEOUT,
    ].includes(action);
  }
}
