import { SupabaseClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma/client";
import { UserRepository } from "@/lib/domain/repositories/UserRepository";
import { VisitorRepository } from "@/lib/domain/repositories/VisitorRepository";
import { AuthService } from "@/lib/domain/services/AuthService";
import { VisitorService } from "@/lib/domain/services/VisitorService";

/**
 * Tiny composition root. Wires concrete repositories (Prisma) into services so
 * route handlers depend on the service interfaces, not the construction graph.
 */
export function buildVisitorService(): VisitorService {
  return new VisitorService(new VisitorRepository(prisma));
}

export function buildAuthService(supabase: SupabaseClient): AuthService {
  return new AuthService(supabase, new UserRepository(prisma));
}
