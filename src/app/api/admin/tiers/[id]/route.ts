import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getTierById, updateTier, deleteTier } from "@/lib/repositories/tier.repository";
import { z } from "zod";

const updateTierSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().min(0).optional(),
  description: z.string().max(500).optional(),
  features: z.array(z.string().min(1).max(200)).max(20).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

async function requireAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id || token.role !== "admin") return false;
  return true;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const existing = await getTierById(id);
    if (!existing) {
      return NextResponse.json({ success: false, data: null, error: "Tier not found" }, { status: 404 });
    }
    const body = await request.json();
    const parsed = updateTierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Validation error" },
        { status: 422 }
      );
    }
    const updated = await updateTier(id, parsed.data);
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/tiers/[id]]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const existing = await getTierById(id);
    if (!existing) {
      return NextResponse.json({ success: false, data: null, error: "Tier not found" }, { status: 404 });
    }
    await deleteTier(id);
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/admin/tiers/[id]]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
