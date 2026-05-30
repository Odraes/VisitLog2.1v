import { NextRequest, NextResponse } from "next/server";
import { buildVisitorService } from "@/lib/container";
import { requireUser, errorResponse } from "@/lib/api/guard";
import { registerVisitorSchema } from "@/lib/utils/validators";
import { Role, VisitorStatus } from "@prisma/client";

/** GET /api/visitors — list/search visitors (Admin: all, Guard: all). */
export async function GET(request: NextRequest) {
  try {
    await requireUser([Role.ADMIN, Role.GUARD]);

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const statusParam = searchParams.get("status") ?? undefined;
    const status =
      statusParam && statusParam in VisitorStatus
        ? (statusParam as VisitorStatus)
        : undefined;

    const service = buildVisitorService();
    const visitors = await service.getAllVisitors({ search, status });

    return NextResponse.json({ visitors: visitors.map((v) => v.toJSON()) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/visitors — resident registers a new visitor. */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([Role.RESIDENT]);

    const body = await request.json();
    const parsed = registerVisitorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 422 }
      );
    }

    const service = buildVisitorService();
    const result = await service.registerVisitor(parsed.data, user.id);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
