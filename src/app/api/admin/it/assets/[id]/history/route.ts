import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { getAssetById, getAssetHistory } from "@/lib/repositories/it-asset.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const asset  = await getAssetById(guard.tenantId, id);
    if (!asset) return NextResponse.json({ success: false, data: null, error: "Asset not found" }, { status: 404 });

    const history = await getAssetHistory(id);
    return NextResponse.json({ success: true, data: history, error: null });
  } catch (err) {
    console.error("[GET /api/admin/it/assets/[id]/history]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
