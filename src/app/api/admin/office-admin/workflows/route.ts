/**
 * Workflow Engine — /api/admin/office-admin/workflows
 *
 * POST: Create a workflow request (ISSUE_ITEM, ADD_STOCK, TRANSFER, REQUEST_SUPPLY, etc.)
 * GET:  List workflow requests for the tenant
 * PATCH: Approve / Reject a workflow request
 *
 * Workflows are stored in the InventoryAuditLog table as type="workflow.*"
 * with metadata JSON in the payload field, avoiding a new schema migration.
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { emitOfficeEvent } from "@/lib/office-emitter";

const createSchema = z.object({
  subcard:  z.string(),
  type:     z.string(),             // ISSUE_ITEM | ADD_STOCK | TRANSFER | REQUEST_SUPPLY | ...
  itemId:   z.string().optional(),
  itemName: z.string().optional(),
  quantity: z.number().optional(),
  note:     z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const updateSchema = z.object({
  id:     z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  note:   z.string().optional().nullable(),
});

function buildWorkflowPayload(data: z.infer<typeof createSchema>, status: string, actorId: string | undefined) {
  return {
    workflowType: data.type,
    subcard: data.subcard,
    itemId: data.itemId,
    itemName: data.itemName,
    quantity: data.quantity,
    note: data.note,
    status,
    requestedBy: actorId,
    metadata: data.metadata,
  };
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;
    const actorId = token?.id as string | undefined;

    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const id = createId();
    const workflow = await prisma.inventoryAuditLog.create({
      data: {
        id,
        organizationId: guard.tenantId,
        actorId: actorId ?? null,
        action: `workflow.create`,
        targetType: parsed.data.subcard,
        targetId: parsed.data.itemId ?? null,
        payload: buildWorkflowPayload(parsed.data, "PENDING", actorId) as Prisma.InputJsonValue,
      },
    });

    const result = {
      id: workflow.id,
      type: parsed.data.type,
      subcard: parsed.data.subcard,
      status: "PENDING",
      itemName: parsed.data.itemName,
      quantity: parsed.data.quantity,
      note: parsed.data.note,
      createdAt: workflow.createdAt,
    };

    emitOfficeEvent({
      subcard: parsed.data.subcard,
      type: "WORKFLOW_CREATED",
      payload: result,
      actor: actorId,
      ts: Date.now(),
    });

    return NextResponse.json({ success: true, data: result, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/office-admin/workflows]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const subcard = searchParams.get("subcard") ?? "";
    const limit   = parseInt(searchParams.get("limit") ?? "50");

    const logs = await prisma.inventoryAuditLog.findMany({
      where: {
        organizationId: guard.tenantId,
        action: { startsWith: "workflow." },
        ...(subcard ? { targetType: subcard } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const workflows = logs.map((l) => {
      const meta = (l.payload && typeof l.payload === "object" && !Array.isArray(l.payload))
        ? (l.payload as Record<string, unknown>)
        : {};
      return { id: l.id, actorId: l.actorId, createdAt: l.createdAt, ...meta };
    });

    return NextResponse.json({ success: true, data: workflows, error: null });
  } catch (err) {
    console.error("[GET /api/admin/office-admin/workflows]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;
    const actorId = token?.id as string | undefined;

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const existing = await prisma.inventoryAuditLog.findFirst({
      where: { id: parsed.data.id, organizationId: guard.tenantId },
    });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Workflow not found" }, { status: 404 });

    const meta: Record<string, unknown> =
      (existing.payload && typeof existing.payload === "object" && !Array.isArray(existing.payload))
        ? { ...(existing.payload as Record<string, unknown>) }
        : {};

    meta.status = parsed.data.action === "APPROVE" ? "APPROVED" : "REJECTED";
    meta.resolvedBy = actorId;
    meta.resolvedNote = parsed.data.note;

    const updated = await prisma.inventoryAuditLog.update({
      where: { id: parsed.data.id },
      data: { payload: meta as Prisma.InputJsonValue },
    });

    emitOfficeEvent({
      subcard: String(meta.subcard ?? ""),
      type: "WORKFLOW_UPDATED",
      payload: { id: updated.id, status: meta.status },
      actor: actorId,
      ts: Date.now(),
    });

    return NextResponse.json({ success: true, data: { id: updated.id, status: meta.status }, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/office-admin/workflows]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
