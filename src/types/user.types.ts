import { Role } from "@prisma/client";

export { Role };

/** Permissions a user role is granted. */
export enum Permission {
  READ_ALL = "READ_ALL",
  READ_OWN = "READ_OWN",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOG_TIMEIN = "LOG_TIMEIN",
  LOG_TIMEOUT = "LOG_TIMEOUT",
}

/** Concrete actions a user may attempt to perform. */
export enum Action {
  REGISTER_VISITOR = "REGISTER_VISITOR",
  VIEW_OWN_VISITORS = "VIEW_OWN_VISITORS",
  VIEW_ALL_VISITORS = "VIEW_ALL_VISITORS",
  SCAN_QR = "SCAN_QR",
  LOOKUP_VISITOR = "LOOKUP_VISITOR",
  LOG_TIMEIN = "LOG_TIMEIN",
  LOG_TIMEOUT = "LOG_TIMEOUT",
  UPDATE_VISITOR = "UPDATE_VISITOR",
  DELETE_VISITOR = "DELETE_VISITOR",
}

/** Plain serializable representation of a user (sent to the client). */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  unitNumber?: string | null;
  createdAt: string;
  dashboardPath: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  unitNumber?: string;
}

export interface CreateProfileDTO {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  unitNumber?: string | null;
}

export interface UpdateProfileDTO {
  fullName?: string;
  unitNumber?: string | null;
}
