import { Visitor } from "@/lib/domain/entities/Visitor";
import {
  RegisterVisitorDTO,
  UpdateVisitorDTO,
  VisitorFilters,
  VisitorResult,
} from "@/types/visitor.types";

/** Governs all visitor-related business operations. */
export interface IVisitorService {
  registerVisitor(
    data: RegisterVisitorDTO,
    registrantId: string
  ): Promise<VisitorResult>;
  lookupByCode(code: string): Promise<Visitor | null>;
  logTimeIn(visitorId: string): Promise<Visitor>;
  logTimeOut(visitorId: string): Promise<Visitor>;
  getAllVisitors(filters?: VisitorFilters): Promise<Visitor[]>;
  getVisitorById(id: string): Promise<Visitor | null>;
  updateVisitor(id: string, data: UpdateVisitorDTO): Promise<Visitor>;
  deleteVisitor(id: string): Promise<void>;
}
