import { RegisterDTO, UserProfile } from "@/types/user.types";
import { User } from "@/lib/domain/entities/User";

export interface AuthResult {
  user: User;
  profile: UserProfile;
}

/** Governs authentication and registration flows. */
export interface IAuthService {
  register(data: RegisterDTO): Promise<AuthResult>;
  getCurrentUser(): Promise<User | null>;
}
