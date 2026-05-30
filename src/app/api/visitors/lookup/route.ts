import { NextRequest, NextResponse } from "next/server";
import { buildVisitorService } from "@/lib/container";
import { requireUser, errorResponse } from "@/lib/api/guard";
import { Role } from "@prisma/client";

/** GET /api/visitors/lookup?code=XYZ — guard resolves an access code. */
export async function GET(request: NextRequest) {
  try {
    await requireUser([Role.GUARD, Role.ADMIN]);

    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json(
        { error: "Missing access code" },
        { status: 422 }
      );
    }

    const service = buildVisitorService();
    const visitor = await service.lookupByCode(code);

    if (!visitor) {
      return NextResponse.json(
        { error: "No visitor found for that code" },
        { status: 404 }
      );
    }

    return NextResponse.json({ visitor: visitor.toJSON() });
  } catch (err) {
    return errorResponse(err);
  }
}
