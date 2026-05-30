import { Visitor as PrismaVisitor, VisitorStatus } from "@prisma/client";
import { VisitorRecord } from "@/types/visitor.types";

/**
 * Domain entity wrapping a visitor record. Encapsulates persisted fields as
 * private members and exposes visit-lifecycle business rules as methods.
 */
export class Visitor {
  private readonly _id: string;
  private readonly _fullName: string;
  private readonly _idPictureUrl: string;
  private readonly _email: string;
  private readonly _purpose: string;
  private readonly _targetUnit: string;
  private readonly _expectedArrival: Date;
  private readonly _accessCode: string;
  private readonly _status: VisitorStatus;
  private readonly _timeIn: Date | null;
  private readonly _timeOut: Date | null;
  private readonly _registeredById: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(record: PrismaVisitor) {
    this._id = record.id;
    this._fullName = record.fullName;
    this._idPictureUrl = record.idPictureUrl;
    this._email = record.email;
    this._purpose = record.purpose;
    this._targetUnit = record.targetUnit;
    this._expectedArrival = record.expectedArrival;
    this._accessCode = record.accessCode;
    this._status = record.status;
    this._timeIn = record.timeIn;
    this._timeOut = record.timeOut;
    this._registeredById = record.registeredById;
    this._createdAt = record.createdAt;
    this._updatedAt = record.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get accessCode(): string {
    return this._accessCode;
  }

  get status(): VisitorStatus {
    return this._status;
  }

  /** Visitor has arrived and not yet left. */
  isCurrentlyInside(): boolean {
    return this._status === VisitorStatus.TIMED_IN;
  }

  /** A time-in is only valid for a visitor who has not yet entered. */
  canTimeIn(): boolean {
    return this._status === VisitorStatus.PENDING;
  }

  /** A time-out is only valid for a visitor currently inside. */
  canTimeOut(): boolean {
    return this._status === VisitorStatus.TIMED_IN;
  }

  /** Whether the current time is within ±4 hours of expected arrival. */
  isExpected(now: Date = new Date()): boolean {
    const windowMs = 4 * 60 * 60 * 1000;
    const diff = Math.abs(now.getTime() - this._expectedArrival.getTime());
    return diff <= windowMs;
  }

  toJSON(): VisitorRecord {
    return {
      id: this._id,
      fullName: this._fullName,
      idPictureUrl: this._idPictureUrl,
      email: this._email,
      purpose: this._purpose,
      targetUnit: this._targetUnit,
      expectedArrival: this._expectedArrival.toISOString(),
      accessCode: this._accessCode,
      status: this._status,
      timeIn: this._timeIn ? this._timeIn.toISOString() : null,
      timeOut: this._timeOut ? this._timeOut.toISOString() : null,
      registeredById: this._registeredById,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
