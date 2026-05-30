import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAuthService } from "@/lib/container";
import { User } from "@/lib/domain/entities/User";
import { Role } from "@/types/user.types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

/**
 * Resolves the authenticated domain user from request cookies and optionally
 * enforces a role allow-list. Throws ApiError (401/403) when checks fail.
 */
export async function requireUser(allowedRoles?: Role[]): Promise<User> {
  const supabase = createClient();
  const authService = buildAuthService(supabase);
  const user = await authService.getCurrentUser();

  if (!user) {
    throw new ApiError("Unauthorized", 401);
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ApiError("Forbidden", 403);
  }
  return user;
}

/** Maps thrown errors to a JSON response with a sensible status code. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return NextResponse.json({ error: message }, { status: 400 });
}
