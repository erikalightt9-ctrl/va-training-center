import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — Export enrollments as CSV                                    */
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

    const enrollments = await prisma.enrollment.findMany({
      where: { organizationId: orgId },
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const header = "Student Name,Student Email,Course,Status,Tier,Enrolled At\n";
    const rows = enrollments.map((e) => {
      const name = (e.student?.name ?? "Unknown").replace(/,/g, " ");
      const email = e.student?.email ?? "";
      const course = e.course.title.replace(/,/g, " ");
      const status = e.status;
      const tier = e.courseTier ?? "";
      const date = new Date(e.createdAt).toISOString().split("T")[0];
      return `${name},${email},${course},${status},${tier},${date}`;
    });

    const csv = header + rows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="enrollments-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/corporate/reports/export]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
