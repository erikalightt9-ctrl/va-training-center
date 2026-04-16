import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { assignAsset } from "@/lib/repositories/it-asset.repository";

const schema = z.object({
  employeeId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id }  = await params;
    const body    = await request.json();
    const parsed  = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: "employeeId is required" }, { status: 422 });
    }

    const asset = await assignAsset(guard.tenantId, id, parsed.data.employeeId);
    return NextResponse.json({ success: true, data: asset, error: null });
  } catch (err) {
    console.error("[POST /api/admin/it/assets/[id]/assign]", err);
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
