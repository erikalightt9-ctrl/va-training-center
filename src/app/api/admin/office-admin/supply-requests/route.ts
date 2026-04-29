/**
 * Admin Supply Requests — /api/admin/office-admin/supply-requests
 *
 * GET:   List supply requests for the tenant (filterable by status)
 * PATCH: Approve / Reject / Complete a request
 *        - APPROVE: deducts stock, writes stock_updated + request_approved audit logs
 *        - REJECT:  writes request_rejected audit log, notifies requester
 *        - COMPLETE: writes request_completed audit log, notifies requester
 *
 * Audit log actions: request_approved | request_rejected | stock_updated | request_completed
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/repositories/notification.repository";
import { sendMail } from "@/lib/mailer";
import { emitOfficeEvent } from "@/lib/office-emitter";

const updateSchema = z.object({
  id:              z.string(),
  action:          z.enum(["APPROVE", "REJECT", "COMPLETE"]),
  note:            z.string().optional().nullable(),
  inventoryItemId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") ?? "";
    const limit        = Math.min(parseInt(searchParams.get("limit") ?? "100"), 200);

    const logs = await prisma.inventoryAuditLog.findMany({
      where:   { organizationId: guard.tenantId, action: "request_created" },
      orderBy: { createdAt: "desc" },
      take:    limit,
    });

    const requests = logs
      .map((l) => {
        const meta = (l.payload && typeof l.payload === "object" && !Array.isArray(l.payload))
          ? (l.payload as Record<string, unknown>)
          : {};
        return { id: l.id, createdAt: l.createdAt, ...meta };
      })
      .filter((r) => !statusFilter || (r as Record<string, unknown>).status === statusFilter);

    return NextResponse.json({ success: true, data: requests, error: null });
  } catch (err) {
    console.error("[GET /api/admin/office-admin/supply-requests]", err);
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
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const existing = await prisma.inventoryAuditLog.findFirst({
      where: { id: parsed.data.id, organizationId: guard.tenantId, action: "request_created" },
    });
    if (!existing) {
      return NextResponse.json({ success: false, data: null, error: "Request not found" }, { status: 404 });
    }

    const meta: Record<string, unknown> =
      (existing.payload && typeof existing.payload === "object" && !Array.isArray(existing.payload))
        ? { ...(existing.payload as Record<string, unknown>) }
        : {};

    const qty      = Math.abs(Number(meta.quantity ?? 1));
    const itemName = String(meta.itemName ?? "item");
    const unit     = String(meta.unit ?? "piece");
    const now      = new Date().toISOString();

    // ── APPROVE ──────────────────────────────────────────────────────────────
    if (parsed.data.action === "APPROVE") {
      meta.status       = "APPROVED";
      meta.approvedBy   = actorId;
      meta.approvedAt   = now;
      meta.approvalNote = parsed.data.note ?? null;

      if (parsed.data.inventoryItemId) {
        meta.inventoryItemId = parsed.data.inventoryItemId;

        // Atomically deduct stock + record movement
        await prisma.$transaction([
          prisma.inventoryItem.updateMany({
            where: { id: parsed.data.inventoryItemId, organizationId: guard.tenantId },
            data:  { totalStock: { decrement: qty } },
          }),
          prisma.stockMovement.create({
            data: {
              id:             createId(),
              organizationId: guard.tenantId,
              itemId:         parsed.data.inventoryItemId,
              type:           "OUT",
              quantity:       -qty,
              note:           `ISSUE_ITEM — request by ${meta.requesterName ?? "employee"} (${meta.employeeNumber ?? ""})`,
              userId:         actorId,
            },
          }),
        ]);

        // stock_updated audit log
        await prisma.inventoryAuditLog.create({
          data: {
            id:             createId(),
            organizationId: guard.tenantId,
            actorId:        actorId ?? null,
            action:         "stock_updated",
            targetType:     "supply_request",
            targetId:       parsed.data.inventoryItemId,
            payload: {
              type:        "ISSUE_ITEM",
              itemId:      parsed.data.inventoryItemId,
              quantity:    -qty,
              performedBy: actorId,
              approvedBy:  actorId,
              requestId:   parsed.data.id,
              requester:   meta.requesterName,
              timestamp:   now,
            } as Prisma.InputJsonValue,
          },
        }).catch(() => {});
      }

      // request_approved audit log
      await prisma.inventoryAuditLog.create({
        data: {
          id:             createId(),
          organizationId: guard.tenantId,
          actorId:        actorId ?? null,
          action:         "request_approved",
          targetType:     "supply_request",
          targetId:       parsed.data.id,
          payload: {
            requestId:   parsed.data.id,
            approvedBy:  actorId,
            performedBy: actorId,
            itemName,
            quantity:    qty,
            unit,
            requester:   meta.requesterName,
            timestamp:   now,
          } as Prisma.InputJsonValue,
        },
      }).catch(() => {});

    // ── REJECT ───────────────────────────────────────────────────────────────
    } else if (parsed.data.action === "REJECT") {
      meta.status          = "REJECTED";
      meta.rejectedBy      = actorId;
      meta.rejectedAt      = now;
      meta.rejectionReason = parsed.data.note ?? null;

      await prisma.inventoryAuditLog.create({
        data: {
          id:             createId(),
          organizationId: guard.tenantId,
          actorId:        actorId ?? null,
          action:         "request_rejected",
          targetType:     "supply_request",
          targetId:       parsed.data.id,
          payload: {
            requestId:       parsed.data.id,
            rejectedBy:      actorId,
            rejectionReason: parsed.data.note,
            itemName,
            quantity:        qty,
            requester:       meta.requesterName,
            timestamp:       now,
          } as Prisma.InputJsonValue,
        },
      }).catch(() => {});

    // ── COMPLETE ─────────────────────────────────────────────────────────────
    } else {
      meta.status      = "COMPLETED";
      meta.completedBy = actorId;
      meta.completedAt = now;

      await prisma.inventoryAuditLog.create({
        data: {
          id:             createId(),
          organizationId: guard.tenantId,
          actorId:        actorId ?? null,
          action:         "request_completed",
          targetType:     "supply_request",
          targetId:       parsed.data.id,
          payload: {
            requestId:   parsed.data.id,
            completedBy: actorId,
            performedBy: actorId,
            itemName,
            quantity:    qty,
            unit,
            requester:   meta.requesterName,
            timestamp:   now,
          } as Prisma.InputJsonValue,
        },
      }).catch(() => {});
    }

    // Update the request record status
    await prisma.inventoryAuditLog.update({
      where: { id: parsed.data.id },
      data:  { payload: meta as Prisma.InputJsonValue },
    });

    // ── Notify the requesting employee ──────────────────────────────────────
    const requesterId    = String(meta.requesterId    ?? "");
    const requesterEmail = String(meta.requesterEmail ?? "");

    const notifMap: Record<string, { title: string; message: string; subject: string }> = {
      APPROVE: {
        title:   "Supply Request Approved",
        message: `Your request for ${qty} ${unit}(s) of ${itemName} has been approved. It will be prepared shortly.`,
        subject: "Your Supply Request Has Been Approved",
      },
      REJECT: {
        title:   "Supply Request Rejected",
        message: `Your request for ${itemName} was not approved. Reason: ${parsed.data.note ?? "No reason given."}`,
        subject: "Your Supply Request Was Not Approved",
      },
      COMPLETE: {
        title:   "Item Ready for Collection",
        message: `Your ${itemName} (×${qty}) has been issued. Please collect it from the stockroom.`,
        subject: "Your Supply Request Has Been Fulfilled",
      },
    };

    const notif = notifMap[parsed.data.action];

    if (requesterId) {
      await createNotification({
        recipientType: "EMPLOYEE",
        recipientId:   requesterId,
        type:          "SYSTEM",
        title:         notif.title,
        message:       notif.message,
        linkUrl:       "/employee/supply-requests",
        tenantId:      guard.tenantId,
      });
    }

    if (requesterEmail) {
      sendMail({
        from:    `"Humi Inventory" <no-reply@humi.ph>`,
        to:      requesterEmail,
        subject: notif.subject,
        html:    `<p>${notif.message}</p><p><a href="/employee/supply-requests">View your requests →</a></p>`,
      }).catch(() => {});
    }

    emitOfficeEvent({
      subcard: "supply_request",
      type:    "WORKFLOW_UPDATED",
      payload: { id: parsed.data.id, status: meta.status },
      actor:   actorId,
      ts:      Date.now(),
    });

    return NextResponse.json({
      success: true,
      data:    { id: parsed.data.id, status: meta.status },
      error:   null,
    });
  } catch (err) {
    console.error("[PATCH /api/admin/office-admin/supply-requests]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
