import { NextRequest, NextResponse } from "next/server";
import { buildVisitorService } from "@/lib/container";
import { requireUser, errorResponse } from "@/lib/api/guard";
import { updateVisitorSchema } from "@/lib/utils/validators";
import { Role } from "@prisma/client";

type Params = { params: { id: string } };

/** GET /api/visitors/[id] — fetch a single visitor (Admin or Guard). */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await requireUser([Role.ADMIN, Role.GUARD]);

    const service = buildVisitorService();
    const visitor = await service.getVisitorById(params.id);
    if (!visitor) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ visitor: visitor.toJSON() });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PUT /api/visitors/[id] — update a visitor record (Admin only). */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireUser([Role.ADMIN]);

    const body = await request.json();
    const parsed = updateVisitorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 422 }
      );
    }

    const service = buildVisitorService();
    const visitor = await service.updateVisitor(params.id, parsed.data);
    return NextResponse.json({ visitor: visitor.toJSON() });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE /api/visitors/[id] — delete a visitor record (Admin only). */
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireUser([Role.ADMIN]);

    const service = buildVisitorService();
    await service.deleteVisitor(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
