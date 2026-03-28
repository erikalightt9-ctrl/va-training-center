import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — Calendar events for the organization in a given month       */
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
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10);
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1), 10);

    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59);

    // Pull tasks with due dates
    const tasks = await prisma.organizationTask.findMany({
      where: {
        organizationId: orgId,
        dueDate: { gte: from, lte: to },
      },
      select: { id: true, title: true, dueDate: true, description: true, priority: true },
    });

    // Build event list from tasks
    const events = tasks.map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      type: t.priority === "HIGH" ? ("DEADLINE" as const) : ("TASK" as const),
      date: t.dueDate!.toISOString(),
      time: null,
      description: t.description,
    }));

    return NextResponse.json({ success: true, data: events, error: null });
  } catch (err) {
    console.error("[GET /api/corporate/calendar]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
