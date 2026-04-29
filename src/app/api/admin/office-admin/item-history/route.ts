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
    const targetId   = searchParams.get("targetId")   ?? undefined;
    const targetType = searchParams.get("targetType") ?? undefined;

    if (!targetId && !targetType) {
      return NextResponse.json({ success: false, data: null, error: "Provide targetId or targetType" }, { status: 400 });
    }

    const logs = await prisma.inventoryAuditLog.findMany({
      where: {
        organizationId: guard.tenantId,
        ...(targetId   && { targetId }),
        ...(targetType && { targetType }),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Enrich with actor display name from token cache — do a lightweight lookup
    const actorIds = [...new Set(logs.map((l) => l.actorId).filter(Boolean))] as string[];
    const actors: Record<string, string> = {};

    if (actorIds.length > 0) {
      const managers = await prisma.corporateManager.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true },
      });
      for (const m of managers) {
        actors[m.id] = m.name;
      }
    }

    const enriched = logs.map((l) => ({
      id:         l.id,
      action:     l.action,
      targetType: l.targetType,
      targetId:   l.targetId,
      payload:    l.payload,
      actorId:    l.actorId,
      actorName:  l.actorId ? (actors[l.actorId] ?? "Unknown") : "System",
      createdAt:  l.createdAt,
    }));

    return NextResponse.json({ success: true, data: enriched, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
