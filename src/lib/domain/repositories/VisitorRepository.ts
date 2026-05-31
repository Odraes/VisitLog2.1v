import { PrismaClient, Visitor as PrismaVisitor } from "@prisma/client";
import { IVisitorRepository } from "@/lib/domain/interfaces/IVisitorRepository";
import {
  CreateVisitorDTO,
  UpdateVisitorDTO,
  VisitorFilters,
} from "@/types/visitor.types";

/** Repository Pattern: encapsulates all Visitor persistence behind Prisma. */
export class VisitorRepository implements IVisitorRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findById(id: string): Promise<PrismaVisitor | null> {
    return this.prisma.visitor.findUnique({ where: { id } });
  }

  async findByAccessCode(code: string): Promise<PrismaVisitor | null> {
    return this.prisma.visitor.findUnique({ where: { accessCode: code } });
  }

  async findAll(filters?: VisitorFilters): Promise<PrismaVisitor[]> {
    return this.prisma.visitor.findMany({
      where: {
        status: filters?.status,
        registeredById: filters?.registeredById,
        ...(filters?.search
          ? {
              OR: [
                { fullName: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
                { targetUnit: { contains: filters.search, mode: "insensitive" } },
                { accessCode: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByRegistrant(profileId: string): Promise<PrismaVisitor[]> {
    return this.prisma.visitor.findMany({
      where: { registeredById: profileId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: CreateVisitorDTO): Promise<PrismaVisitor> {
    return this.prisma.visitor.create({
      data: {
        fullName: data.fullName,
        idPictureUrl: data.idPictureUrl,
        email: data.email,
        purpose: data.purpose,
        targetUnit: data.targetUnit,
        expectedArrival: new Date(data.expectedArrival),
        accessCode: data.accessCode,
        registeredById: data.registeredById,
      },
    });
  }

  async update(id: string, data: UpdateVisitorDTO): Promise<PrismaVisitor> {
    return this.prisma.visitor.update({
      where: { id },
      data: {
        ...data,
        ...(data.expectedArrival
          ? { expectedArrival: new Date(data.expectedArrival) }
          : {}),
        // Keep the time-in/out timestamps consistent with a manual status change.
        ...(data.status === "PENDING" ? { timeIn: null, timeOut: null } : {}),
        ...(data.status === "TIMED_IN"
          ? { timeIn: new Date(), timeOut: null }
          : {}),
        ...(data.status === "TIMED_OUT" ? { timeOut: new Date() } : {}),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.visitor.delete({ where: { id } });
  }

  async logTimeIn(id: string): Promise<PrismaVisitor> {
    return this.prisma.visitor.update({
      where: { id },
      data: { status: "TIMED_IN", timeIn: new Date() },
    });
  }

  async logTimeOut(id: string): Promise<PrismaVisitor> {
    return this.prisma.visitor.update({
      where: { id },
      data: { status: "TIMED_OUT", timeOut: new Date() },
    });
  }
}
