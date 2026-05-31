import { VisitorStatus } from "@prisma/client";

export { VisitorStatus };

/** Plain serializable representation of a visitor (sent to the client). */
export interface VisitorRecord {
  id: string;
  fullName: string;
  idPictureUrl: string;
  email: string;
  purpose: string;
  targetUnit: string;
  expectedArrival: string;
  accessCode: string;
  status: VisitorStatus;
  timeIn: string | null;
  timeOut: string | null;
  registeredById: string;
  createdAt: string;
  updatedAt: string;
}

/** Form payload from the resident's registration form. */
export interface RegisterVisitorDTO {
  fullName: string;
  idPictureUrl: string;
  email: string;
  purpose: string;
  targetUnit: string;
  expectedArrival: string; // ISO datetime
}

/** Data needed to persist a new visitor (after a code is generated). */
export interface CreateVisitorDTO extends RegisterVisitorDTO {
  accessCode: string;
  registeredById: string;
}

export interface UpdateVisitorDTO {
  fullName?: string;
  email?: string;
  purpose?: string;
  targetUnit?: string;
  expectedArrival?: string;
  status?: VisitorStatus;
}

export interface VisitorFilters {
  search?: string;
  status?: VisitorStatus;
  registeredById?: string;
}

/** Result of registering a visitor, including the generated QR image. */
export interface VisitorResult {
  visitor: VisitorRecord;
  accessCode: string;
  qrCodeDataUrl: string;
}
