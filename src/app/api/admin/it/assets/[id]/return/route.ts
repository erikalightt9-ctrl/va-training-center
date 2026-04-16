import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { returnAsset } from "@/lib/repositories/it-asset.repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body   = await request.json().catch(() => ({})) as { remarks?: string };

    const asset = await returnAsset(guard.tenantId, id, undefined, body.remarks);
    return NextResponse.json({ success: true, data: asset, error: null });
  } catch (err) {
    console.error("[POST /api/admin/it/assets/[id]/return]", err);
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
