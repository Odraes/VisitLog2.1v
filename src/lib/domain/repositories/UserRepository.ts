import { PrismaClient, Profile } from "@prisma/client";
import { IUserRepository } from "@/lib/domain/interfaces/IUserRepository";
import { CreateProfileDTO, UpdateProfileDTO } from "@/types/user.types";

/** Repository Pattern: encapsulates all Profile persistence behind Prisma. */
export class UserRepository implements IUserRepository {
  private readonly prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async findById(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { email } });
  }

  async create(data: CreateProfileDTO): Promise<Profile> {
    return this.prisma.profile.create({
      data: {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        unitNumber: data.unitNumber ?? null,
      },
    });
  }

  async update(id: string, data: UpdateProfileDTO): Promise<Profile> {
    return this.prisma.profile.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.profile.delete({ where: { id } });
  }
}
