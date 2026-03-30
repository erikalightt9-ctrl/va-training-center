import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAllTiers, createTier } from "@/lib/repositories/tier.repository";
import { z } from "zod";

const createTierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  price: z.number().min(0, "Price must be non-negative"),
  description: z.string().max(500).optional(),
  features: z.array(z.string().min(1).max(200)).max(20),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

async function requireAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id || token.role !== "admin") return false;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }
    const tiers = await getAllTiers();
    return NextResponse.json({ success: true, data: tiers, error: null });
  } catch (err) {
    console.error("[GET /api/admin/tiers]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = createTierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0]?.message ?? "Validation error" },
        { status: 422 }
      );
    }
    const tier = await createTier(parsed.data);
    return NextResponse.json({ success: true, data: tier, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/tiers]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
