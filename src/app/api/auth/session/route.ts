import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAuthService } from "@/lib/container";

/** GET /api/auth/session — return the current user's profile, or null. */
export async function GET() {
  const supabase = createClient();
  const authService = buildAuthService(supabase);
  const user = await authService.getCurrentUser();

  return NextResponse.json({ profile: user ? user.toJSON() : null });
}
