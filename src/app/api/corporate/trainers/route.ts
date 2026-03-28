import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — List trainers assigned to this organization                  */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (
      !token?.id ||
      (token.role !== "corporate" && token.role !== "tenant_admin") ||
      !token.organizationId
    ) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const orgId = token.organizationId as string;

    const assignments = await prisma.tenantTrainer.findMany({
      where: { tenantId: orgId, isActive: true },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            bio: true,
            specializations: true,
            isActive: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const trainers = assignments.map((a) => ({
      id: a.trainer.id,
      name: a.trainer.name,
      email: a.trainer.email,
      phone: a.trainer.phone,
      bio: a.trainer.bio,
      specialization: a.trainer.specializations[0] ?? null,
      isActive: a.trainer.isActive,
    }));

    return NextResponse.json({ success: true, data: trainers, error: null });
  } catch (err) {
    console.error("[GET /api/corporate/trainers]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
