import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const subcard = searchParams.get("subcard") ?? "";
    const limit   = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);

    const logs = await prisma.inventoryAuditLog.findMany({
      where: {
        organizationId: guard.tenantId,
        ...(subcard ? { targetType: subcard } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      actorId: l.actorId,
      detail: l.payload,
      createdAt: l.createdAt,
    }));

    return NextResponse.json({ success: true, data: formatted, error: null });
  } catch (err) {
    console.error("[GET /api/admin/office-admin/activity-logs]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
