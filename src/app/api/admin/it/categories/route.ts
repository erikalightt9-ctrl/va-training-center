import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { listCategories, createCategory } from "@/lib/repositories/it-asset.repository";

const createSchema = z.object({
  name:              z.string().min(1).max(100),
  depreciationYears: z.number().int().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const categories = await listCategories(guard.tenantId);
    return NextResponse.json({ success: true, data: categories, error: null });
  } catch (err) {
    console.error("[GET /api/admin/it/categories]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body   = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.issues[0]?.message ?? "Validation failed" }, { status: 422 });
    }

    const cat = await createCategory(guard.tenantId, parsed.data.name, parsed.data.depreciationYears);
    return NextResponse.json({ success: true, data: cat, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/it/categories]", err);
    const msg = err instanceof Error && err.message.includes("Unique") ? "Category already exists" : "Internal server error";
    return NextResponse.json({ success: false, data: null, error: msg }, { status: 500 });
  }
}
