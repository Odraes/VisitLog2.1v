import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser, errorResponse } from "@/lib/api/guard";
import { Role } from "@/types/user.types";

const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "id-pictures";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** POST /api/upload — upload a visitor ID picture, return its public URL. */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser([Role.RESIDENT, Role.ADMIN]);

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 422 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 422 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller" },
        { status: 422 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
