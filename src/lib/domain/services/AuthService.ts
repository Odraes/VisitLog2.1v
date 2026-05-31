import { SupabaseClient } from "@supabase/supabase-js";
import { IAuthService, AuthResult } from "@/lib/domain/interfaces/IAuthService";
import { IUserRepository } from "@/lib/domain/interfaces/IUserRepository";
import { UserFactory } from "@/lib/domain/factories/UserFactory";
import { User } from "@/lib/domain/entities/User";
import { RegisterDTO } from "@/types/user.types";

export class AuthError extends Error {}

/**
 * Orchestrates authentication. Wraps Supabase Auth and keeps the application's
 * Profile table in sync, always returning domain `User` objects via the factory.
 */
export class AuthService implements IAuthService {
  private readonly supabase: SupabaseClient;
  private readonly userRepository: IUserRepository;

  constructor(supabase: SupabaseClient, userRepository: IUserRepository) {
    this.supabase = supabase;
    this.userRepository = userRepository;
  }

  /**
   * Creates the Supabase auth user (email auto-confirmed via the admin API)
   * and a matching Profile row sharing the same UUID. Requires the supabase
   * client to be initialised with the service-role key.
   */
  async register(data: RegisterDTO): Promise<AuthResult> {
    if (data.role === "ADMIN") {
      throw new AuthError("Admin accounts cannot be created via self-registration");
    }

    const { data: created, error } = await this.supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        fullName: data.fullName,
        role: data.role,
        unitNumber: data.unitNumber ?? null,
      },
    });

    if (error || !created.user) {
      throw new AuthError(error?.message ?? "Failed to create user");
    }

    try {
      const profile = await this.userRepository.create({
        id: created.user.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        unitNumber: data.unitNumber ?? null,
      });

      const user = UserFactory.create(profile);
      return { user, profile: user.toJSON() };
    } catch (err) {
      // Roll back the auth user if the profile insert fails, to avoid orphans.
      await this.supabase.auth.admin.deleteUser(created.user.id);
      throw err;
    }
  }

  /** Resolves the current session into a domain User, or null if signed out. */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return null;

    const profile = await this.userRepository.findById(user.id);
    if (!profile) return null;

    return UserFactory.create(profile);
  }
}
