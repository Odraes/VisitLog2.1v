import { Action, Permission, Role } from "@/types/user.types";
import { User } from "@/lib/domain/entities/User";

export interface DashboardContext {
  path: string;
  title: string;
  allowedActions: Action[];
}

/**
 * Factory Pattern: build the dashboard context (route, title, permitted
 * actions) for a given domain user. Keeps role→UI mapping in one place.
 */
export class DashboardFactory {
  static create(user: User): DashboardContext {
    const allowedActions = Array.from(
      new Set(
        user.getPermissions().flatMap((p) => DashboardFactory.actionsFor(p))
      )
    );

    return {
      path: user.getDashboardPath(),
      title: DashboardFactory.titleFor(user.role),
      allowedActions,
    };
  }

  private static titleFor(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return "Admin Dashboard";
      case Role.RESIDENT:
        return "Resident Dashboard";
      case Role.GUARD:
        return "Guard Dashboard";
      default:
        return "Dashboard";
    }
  }

  private static actionsFor(permission: Permission): Action[] {
    switch (permission) {
      case Permission.READ_ALL:
        return [Action.VIEW_ALL_VISITORS, Action.LOOKUP_VISITOR];
      case Permission.READ_OWN:
        return [Action.VIEW_OWN_VISITORS];
      case Permission.CREATE:
        return [Action.REGISTER_VISITOR];
      case Permission.UPDATE:
        return [Action.UPDATE_VISITOR];
      case Permission.DELETE:
        return [Action.DELETE_VISITOR];
      case Permission.LOG_TIMEIN:
        return [Action.LOG_TIMEIN, Action.SCAN_QR];
      case Permission.LOG_TIMEOUT:
        return [Action.LOG_TIMEOUT];
      default:
        return [];
    }
  }
}
