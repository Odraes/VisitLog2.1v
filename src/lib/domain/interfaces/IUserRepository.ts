import { Profile } from "@prisma/client";
import { CreateProfileDTO, UpdateProfileDTO } from "@/types/user.types";

/** Governs all persistence operations for user profiles. */
export interface IUserRepository {
  findById(id: string): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  create(data: CreateProfileDTO): Promise<Profile>;
  update(id: string, data: UpdateProfileDTO): Promise<Profile>;
  delete(id: string): Promise<void>;
}
