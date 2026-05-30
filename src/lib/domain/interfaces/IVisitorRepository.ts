import { Visitor as PrismaVisitor } from "@prisma/client";
import {
  CreateVisitorDTO,
  UpdateVisitorDTO,
  VisitorFilters,
} from "@/types/visitor.types";

/** Governs all persistence operations for visitor records. */
export interface IVisitorRepository {
  findById(id: string): Promise<PrismaVisitor | null>;
  findByAccessCode(code: string): Promise<PrismaVisitor | null>;
  findAll(filters?: VisitorFilters): Promise<PrismaVisitor[]>;
  findByRegistrant(profileId: string): Promise<PrismaVisitor[]>;
  create(data: CreateVisitorDTO): Promise<PrismaVisitor>;
  update(id: string, data: UpdateVisitorDTO): Promise<PrismaVisitor>;
  delete(id: string): Promise<void>;
  logTimeIn(id: string): Promise<PrismaVisitor>;
  logTimeOut(id: string): Promise<PrismaVisitor>;
}
