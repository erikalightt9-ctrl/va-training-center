import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — Available courses for the organization (tenant-scoped)      */
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

    // Get courses scoped to this org (tenantId) or platform-wide (tenantId = null)
    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        OR: [
          { tenantId: orgId },
          { tenantId: null },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        durationWeeks: true,
        industry: true,
        popularTier: true,
        _count: {
          select: {
            enrollments: {
              where: { organizationId: orgId },
            },
          },
        },
        trainers: {
          select: {
            trainer: { select: { name: true } },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      thumbnailUrl: null,
      tier: c.popularTier ?? null,
      duration: c.durationWeeks ? c.durationWeeks * 7 * 60 : null, // rough minutes estimate
      status: "PUBLISHED",
      enrollmentCount: c._count.enrollments,
      trainerName: c.trainers[0]?.trainer.name ?? null,
    }));

    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    console.error("[GET /api/corporate/courses]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
