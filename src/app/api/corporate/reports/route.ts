import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — Aggregated reports for the organization                     */
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

    // Run all queries in parallel
    const [
      employeeCount,
      enrollments,
      certificates,
    ] = await Promise.all([
      prisma.student.count({ where: { organizationId: orgId } }),
      prisma.enrollment.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          course: { select: { title: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.certificate.count({
        where: { student: { organizationId: orgId } },
      }).catch(() => 0),
    ]);

    const ACTIVE_STATUSES = ["APPROVED", "ENROLLED", "PAYMENT_VERIFIED", "EMAIL_VERIFIED"] as const;
    const COMPLETED_STATUSES = ["PAYMENT_SUBMITTED"] as const; // adjust if there is a "COMPLETED" status

    const activeEnrollments = enrollments.filter(
      (e) => (ACTIVE_STATUSES as readonly string[]).includes(e.status),
    ).length;

    // Since there's no COMPLETED status in the enum, treat REJECTED as done for now
    const completedEnrollments = enrollments.filter(
      (e) => (COMPLETED_STATUSES as readonly string[]).includes(e.status),
    ).length;

    const totalWithResult = activeEnrollments + completedEnrollments;
    const completionRate = totalWithResult > 0
      ? Math.round((completedEnrollments / totalWithResult) * 100)
      : 0;

    // Enrollment trend: last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentEnrollments = enrollments.filter(
      (e) => new Date(e.createdAt) >= sixMonthsAgo,
    );

    const monthMap: Record<string, number> = {};
    for (const e of recentEnrollments) {
      const key = new Date(e.createdAt).toLocaleString("en-US", { month: "short" });
      monthMap[key] = (monthMap[key] ?? 0) + 1;
    }
    const enrollmentsByMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }));

    // Top 5 courses by enrollment count
    const courseCounts: Record<string, { title: string; enrollments: number; completions: number }> = {};
    for (const e of enrollments) {
      const title = e.course.title;
      if (!courseCounts[title]) courseCounts[title] = { title, enrollments: 0, completions: 0 };
      courseCounts[title].enrollments += 1;
      if ((COMPLETED_STATUSES as readonly string[]).includes(e.status)) courseCounts[title].completions += 1;
    }
    const topCourses = Object.values(courseCounts)
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Status breakdown
    const statusBreakdown = enrollments.reduce<Record<string, number>>((acc, e) => ({
      ...acc,
      [e.status]: (acc[e.status] ?? 0) + 1,
    }), {});

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees: employeeCount,
        activeEnrollments,
        completedEnrollments,
        certificatesEarned: certificates,
        completionRate,
        enrollmentsByMonth,
        topCourses,
        statusBreakdown,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/corporate/reports]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
