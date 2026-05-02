import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title:       z.string().min(1).max(300),
  category:    z.string().max(100).default("Supplies"),
  priority:    z.enum(["LOW","NORMAL","HIGH","URGENT"]).default("NORMAL"),
  description: z.string().optional().nullable(),
  requestedBy: z.string().max(200).optional().nullable(),
});

const actionSchema = z.object({
  action:          z.enum(["APPROVE","REJECT","COMPLETE"]),
  approvedBy:      z.string().optional(),
  rejectionReason: z.string().optional(),
  completionNote:  z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const q        = searchParams.get("q")?.trim() ?? undefined;

    if (searchParams.get("stats") === "1") {
      const [total, pending, approved, completed, rejected] = await Promise.all([
        prisma.adminOfficeRequest.count({ where: { organizationId: guard.tenantId } }),
        prisma.adminOfficeRequest.count({ where: { organizationId: guard.tenantId, status: "PENDING" } }),
        prisma.adminOfficeRequest.count({ where: { organizationId: guard.tenantId, status: "APPROVED" } }),
        prisma.adminOfficeRequest.count({ where: { organizationId: guard.tenantId, status: "COMPLETED" } }),
        prisma.adminOfficeRequest.count({ where: { organizationId: guard.tenantId, status: "REJECTED" } }),
      ]);
      return NextResponse.json({ success: true, data: { total, pending, approved, completed, rejected }, error: null });
    }

    const where: Prisma.AdminOfficeRequestWhereInput = {
      organizationId: guard.tenantId,
      ...(status   && { status:   status   as never }),
      ...(category && { category }),
      ...(q && { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }),
    };

    const data = await prisma.adminOfficeRequest.findMany({ where, orderBy: [{ priority: "asc" }, { createdAt: "desc" }] });
    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const record = await prisma.adminOfficeRequest.create({
      data: { id: createId(), organizationId: guard.tenantId, ...parsed.data },
    });
    return NextResponse.json({ success: true, data: record, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    const existing = await prisma.adminOfficeRequest.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const body = await request.json();

    // Action (approve/reject/complete)
    const actionParsed = actionSchema.safeParse(body);
    if (actionParsed.success) {
      const { action, approvedBy, rejectionReason, completionNote } = actionParsed.data;
      const statusMap = { APPROVE: "APPROVED", REJECT: "REJECTED", COMPLETE: "COMPLETED" } as const;
      const updated = await prisma.adminOfficeRequest.update({
        where: { id },
        data: {
          status:          statusMap[action],
          approvedBy:      action === "APPROVE" ? (approvedBy ?? (token?.name as string) ?? "Admin") : undefined,
          rejectionReason: action === "REJECT"  ? rejectionReason : undefined,
          completionNote:  action === "COMPLETE"? completionNote  : undefined,
          updatedAt:       new Date(),
        },
      });

      await prisma.inventoryAuditLog.create({
        data: { id: createId(), organizationId: guard.tenantId, actorId: token?.id as string ?? null, action: `request_${action.toLowerCase()}d` as string, targetType: "office_request", targetId: id, payload: { title: existing.title, action, performedBy: (token?.name as string) ?? "admin", timestamp: new Date().toISOString() } as Prisma.InputJsonValue },
      }).catch(() => {});

      return NextResponse.json({ success: true, data: updated, error: null });
    }

    // Regular edit
    const editParsed = createSchema.partial().safeParse(body);
    if (!editParsed.success) return NextResponse.json({ success: false, data: null, error: editParsed.error.message }, { status: 400 });
    const updated = await prisma.adminOfficeRequest.update({ where: { id }, data: { ...editParsed.data, updatedAt: new Date() } });
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });
    await prisma.adminOfficeRequest.deleteMany({ where: { id, organizationId: guard.tenantId } });
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
