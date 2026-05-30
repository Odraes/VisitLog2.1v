import { NextRequest, NextResponse } from "next/server";
import { buildVisitorService } from "@/lib/container";
import { requireUser, errorResponse } from "@/lib/api/guard";
import { Role } from "@prisma/client";

type Params = { params: { id: string } };

/** POST /api/visitors/[id]/timeout — guard logs the visitor's time-out. */
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    await requireUser([Role.GUARD, Role.ADMIN]);
    const service = buildVisitorService();
    const visitor = await service.logTimeOut(params.id);
    return NextResponse.json({ visitor: visitor.toJSON() });
  } catch (err) {
    return errorResponse(err);
  }
}
