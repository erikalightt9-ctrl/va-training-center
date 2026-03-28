import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: z.string().nullable().optional(),
  assigneeName: z.string().max(100).nullable().optional(),
});

/* ------------------------------------------------------------------ */
/*  Auth helper                                                        */
/* ------------------------------------------------------------------ */

async function getOrgId(request: NextRequest): Promise<string | null> {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (
    !token?.id ||
    (token.role !== "corporate" && token.role !== "tenant_admin") ||
    !token.organizationId
  ) return null;
  return token.organizationId as string;
}

/* ------------------------------------------------------------------ */
/*  GET — List tasks for the organization                              */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgId(request);
    if (!orgId) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.organizationTask.findMany({
      where: { organizationId: orgId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: tasks, error: null });
  } catch (err) {
    console.error("[GET /api/corporate/tasks]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  POST — Create a new task                                           */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    const orgId = await getOrgId(request);
    if (!orgId) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0].message },
        { status: 422 },
      );
    }

    const { title, description, priority, status, dueDate, assigneeName } = parsed.data;

    const task = await prisma.organizationTask.create({
      data: {
        organizationId: orgId,
        title,
        description: description ?? null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeName: assigneeName ?? null,
      },
    });

    return NextResponse.json({ success: true, data: task, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/corporate/tasks]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
