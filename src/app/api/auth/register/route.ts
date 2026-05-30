import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { buildAuthService } from "@/lib/container";
import { registerSchema } from "@/lib/utils/validators";
import { errorResponse } from "@/lib/api/guard";

/** POST /api/auth/register — create a Supabase user + Profile row. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 422 }
      );
    }

    // Registration needs the service-role client to create the auth user.
    const supabase = createServiceRoleClient();
    const authService = buildAuthService(supabase);
    const { profile } = await authService.register(parsed.data);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
