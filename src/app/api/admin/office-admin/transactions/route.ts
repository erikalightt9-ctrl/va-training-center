/**
 * Transaction Engine — POST /api/admin/office-admin/transactions
 *
 * Accepts a transaction payload, persists to the appropriate model,
 * then emits an SSE event so all connected clients update in real-time.
 *
 * Supported types:
 *   UPDATE_CELL   — inline cell edit (stock qty, location, etc.)
 *   STOCK_IN      — add stock movement
 *   STOCK_OUT     — issue/deduct stock movement
 *   STOCK_ADJUST  — adjust stock movement
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { emitOfficeEvent } from "@/lib/office-emitter";

const schema = z.object({
  subcard: z.enum(["officeSupplies", "maintenanceSupplies", "medicalSupplies", "stockroom", "fuelMaintenance"]),
  type: z.enum(["UPDATE_CELL", "STOCK_IN", "STOCK_OUT", "STOCK_ADJUST"]),
  payload: z.object({
    id:      z.string().optional(),            // entity id
    colKey:  z.string().optional(),            // for UPDATE_CELL
    value:   z.unknown().optional(),           // new value
    quantity:z.number().optional(),            // for STOCK_* types
    note:    z.string().optional().nullable(), // for STOCK_* types
  }),
});

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const { subcard, type, payload } = parsed.data;
    const { tenantId } = guard;
    const actorId = token?.id as string | undefined;

    let result: Record<string, unknown> = {};

    // ── UPDATE_CELL ─────────────────────────────────────────────────────────
    if (type === "UPDATE_CELL" && payload.id && payload.colKey !== undefined) {
      const colKey = payload.colKey;
      const value  = payload.value;

      if (subcard === "officeSupplies") {
        const item = await prisma.inventoryItem.findFirst({ where: { id: payload.id, organizationId: tenantId } });
        if (!item) return NextResponse.json({ success: false, data: null, error: "Item not found" }, { status: 404 });
        const updated = await prisma.inventoryItem.update({
          where: { id: payload.id },
          data: { [colKey]: typeof value === "number" ? value : String(value ?? "") },
        });
        result = updated as unknown as Record<string, unknown>;

        // If stock changed, also record a movement
        if (colKey === "totalStock") {
          const delta = Number(value) - Number(item.totalStock);
          await prisma.stockMovement.create({
            data: {
              id: createId(), organizationId: tenantId, itemId: payload.id,
              type: delta >= 0 ? "ADJUST" : "ADJUST",
              quantity: delta, note: "Cell edit", userId: actorId,
            },
          });
        }
      }

      if (subcard === "maintenanceSupplies") {
        const updated = await prisma.adminMaintenanceItem.update({
          where: { id: payload.id },
          data: { [colKey]: typeof value === "number" ? value : String(value ?? ""), updatedAt: new Date() },
        });
        result = updated as unknown as Record<string, unknown>;
      }

      if (subcard === "stockroom") {
        const updated = await prisma.adminStockItem.update({
          where: { id: payload.id },
          data: { [colKey]: typeof value === "number" ? value : String(value ?? ""), updatedAt: new Date() },
        });
        result = updated as unknown as Record<string, unknown>;
      }

      if (subcard === "medicalSupplies") {
        // quantity / reorderLevel only — full update handled by medical-supplies route
        const existing = await prisma.adminPantryItem.findFirst({
          where: { id: payload.id, organizationId: tenantId, notes: { startsWith: "__medicine__" } },
        });
        if (existing) {
          const updated = await prisma.adminPantryItem.update({
            where: { id: payload.id },
            data: { [colKey === "quantity" ? "quantity" : "reorderLevel"]: Number(value), updatedAt: new Date() },
          });
          result = updated as unknown as Record<string, unknown>;
        }
      }
    }

    // ── STOCK_IN / STOCK_OUT / STOCK_ADJUST ─────────────────────────────────
    if ((type === "STOCK_IN" || type === "STOCK_OUT" || type === "STOCK_ADJUST") && payload.id) {
      const qty = Math.abs(payload.quantity ?? 0);
      const signed = type === "STOCK_OUT" ? -qty : qty;
      const mvType = type === "STOCK_IN" ? "IN" : type === "STOCK_OUT" ? "OUT" : "ADJUST";

      if (subcard === "officeSupplies") {
        const item = await prisma.inventoryItem.findFirst({ where: { id: payload.id, organizationId: tenantId } });
        if (!item) return NextResponse.json({ success: false, data: null, error: "Item not found" }, { status: 404 });
        const [movement] = await prisma.$transaction([
          prisma.stockMovement.create({
            data: {
              id: createId(), organizationId: tenantId, itemId: payload.id,
              type: mvType, quantity: signed, note: payload.note ?? null, userId: actorId,
            },
          }),
          prisma.inventoryItem.update({
            where: { id: payload.id },
            data: { totalStock: { increment: signed } },
          }),
        ]);
        result = movement as unknown as Record<string, unknown>;
      }

      if (subcard === "maintenanceSupplies") {
        const item = await prisma.adminMaintenanceItem.findFirst({ where: { id: payload.id, organizationId: tenantId } });
        if (!item) return NextResponse.json({ success: false, data: null, error: "Item not found" }, { status: 404 });
        const updated = await prisma.adminMaintenanceItem.update({
          where: { id: payload.id },
          data: { quantity: { increment: signed }, updatedAt: new Date() },
        });
        result = updated as unknown as Record<string, unknown>;
      }

      if (subcard === "stockroom") {
        const item = await prisma.adminStockItem.findFirst({ where: { id: payload.id, organizationId: tenantId } });
        if (!item) return NextResponse.json({ success: false, data: null, error: "Item not found" }, { status: 404 });
        const updated = await prisma.adminStockItem.update({
          where: { id: payload.id },
          data: { quantity: { increment: signed }, updatedAt: new Date() },
        });
        result = updated as unknown as Record<string, unknown>;
      }

      if (subcard === "medicalSupplies") {
        const item = await prisma.adminPantryItem.findFirst({
          where: { id: payload.id, organizationId: tenantId, notes: { startsWith: "__medicine__" } },
        });
        if (!item) return NextResponse.json({ success: false, data: null, error: "Item not found" }, { status: 404 });
        const updated = await prisma.adminPantryItem.update({
          where: { id: payload.id },
          data: { quantity: { increment: signed }, updatedAt: new Date() },
        });
        result = updated as unknown as Record<string, unknown>;
      }
    }

    // ── Emit SSE event ───────────────────────────────────────────────────────
    emitOfficeEvent({
      subcard,
      type: type === "UPDATE_CELL" ? "CELL_UPDATED" : "STOCK_MOVED",
      payload: { ...payload, result },
      actor: actorId,
      ts: Date.now(),
    });

    // ── Audit log ────────────────────────────────────────────────────────────
    await prisma.inventoryAuditLog.create({
      data: {
        id: createId(), organizationId: tenantId, actorId: actorId ?? null,
        action: `transaction.${type.toLowerCase()}`,
        targetType: subcard, targetId: payload.id ?? null,
        payload: payload as Prisma.InputJsonValue,
      },
    }).catch(() => {}); // non-blocking

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err) {
    console.error("[POST /api/admin/office-admin/transactions]", err);
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
