import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  itemName:     z.string().min(1).max(200),
  vendorName:   z.string().max(200).optional().nullable(),
  quantity:     z.number().min(0).default(0),
  unit:         z.string().max(50).default("pcs"),
  unitPrice:    z.number().min(0).optional().nullable(),
  poNumber:     z.string().max(100).optional().nullable(),
  deliveryDate: z.string().optional().nullable(),
  status:       z.enum(["PENDING", "ORDERED", "DELIVERED", "CANCELLED"]).default("PENDING"),
  notes:        z.string().optional().nullable(),
});

const bulkSchema = z.object({
  rows: z.array(itemSchema).min(1).max(500),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const q      = searchParams.get("q")?.trim() ?? undefined;

    const where: Prisma.AdminProcurementItemWhereInput = {
      organizationId: guard.tenantId,
      ...(status && { status: status as never }),
      ...(q && {
        OR: [
          { itemName:   { contains: q, mode: "insensitive" } },
          { vendorName: { contains: q, mode: "insensitive" } },
          { poNumber:   { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    if (searchParams.get("stats") === "1") {
      const [total, pending, ordered, delivered] = await Promise.all([
        prisma.adminProcurementItem.count({ where: { organizationId: guard.tenantId } }),
        prisma.adminProcurementItem.count({ where: { organizationId: guard.tenantId, status: "PENDING" } }),
        prisma.adminProcurementItem.count({ where: { organizationId: guard.tenantId, status: "ORDERED" } }),
        prisma.adminProcurementItem.count({ where: { organizationId: guard.tenantId, status: "DELIVERED" } }),
      ]);
      return NextResponse.json({ success: true, data: { total, pending, ordered, delivered }, error: null });
    }

    const data = await prisma.adminProcurementItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

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

    const body = await request.json();

    // Bulk insert
    if (body.rows !== undefined) {
      const parsed = bulkSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

      const actorName = (token?.name as string | undefined) ?? "admin";
      const records = parsed.data.rows.map((r) => ({
        id: createId(),
        organizationId: guard.tenantId,
        itemName:     r.itemName,
        vendorName:   r.vendorName ?? null,
        quantity:     r.quantity,
        unit:         r.unit,
        unitPrice:    r.unitPrice ?? null,
        poNumber:     r.poNumber ?? null,
        deliveryDate: r.deliveryDate ? new Date(r.deliveryDate) : null,
        status:       r.status,
        notes:        r.notes ?? null,
        createdBy:    actorName,
        updatedBy:    actorName,
      }));

      await prisma.adminProcurementItem.createMany({ data: records });

      // Audit log
      await prisma.inventoryAuditLog.create({
        data: {
          id: createId(), organizationId: guard.tenantId, actorId: token?.id as string ?? null,
          action: "bulk_import", targetType: "procurement", targetId: null,
          payload: { count: records.length, performedBy: actorName, timestamp: new Date().toISOString() } as Prisma.InputJsonValue,
        },
      }).catch(() => {});

      return NextResponse.json({ success: true, data: { inserted: records.length }, error: null }, { status: 201 });
    }

    // Single insert
    const parsed = itemSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const actorName = (token?.name as string | undefined) ?? "admin";
    const record = await prisma.adminProcurementItem.create({
      data: {
        id: createId(), organizationId: guard.tenantId,
        itemName:     parsed.data.itemName,
        vendorName:   parsed.data.vendorName ?? null,
        quantity:     parsed.data.quantity,
        unit:         parsed.data.unit,
        unitPrice:    parsed.data.unitPrice ?? null,
        poNumber:     parsed.data.poNumber ?? null,
        deliveryDate: parsed.data.deliveryDate ? new Date(parsed.data.deliveryDate) : null,
        status:       parsed.data.status,
        notes:        parsed.data.notes ?? null,
        createdBy:    actorName,
        updatedBy:    actorName,
      },
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

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    const existing = await prisma.adminProcurementItem.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const parsed = itemSchema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const actorName = (token?.name as string | undefined) ?? "admin";
    const updated = await prisma.adminProcurementItem.update({
      where: { id },
      data: {
        ...parsed.data,
        deliveryDate: parsed.data.deliveryDate ? new Date(parsed.data.deliveryDate) : (parsed.data.deliveryDate === null ? null : undefined),
        updatedBy: actorName,
        updatedAt: new Date(),
      },
    });

    await prisma.inventoryAuditLog.create({
      data: {
        id: createId(), organizationId: guard.tenantId, actorId: token?.id as string ?? null,
        action: "item_updated", targetType: "procurement", targetId: id,
        payload: { changes: parsed.data, performedBy: actorName, timestamp: new Date().toISOString() } as Prisma.InputJsonValue,
      },
    }).catch(() => {});

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

    const existing = await prisma.adminProcurementItem.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    await prisma.adminProcurementItem.delete({ where: { id } });

    await prisma.inventoryAuditLog.create({
      data: {
        id: createId(), organizationId: guard.tenantId, actorId: token?.id as string ?? null,
        action: "item_deleted", targetType: "procurement", targetId: id,
        payload: { itemName: existing.itemName, performedBy: (token?.name as string | undefined) ?? "admin", timestamp: new Date().toISOString() } as Prisma.InputJsonValue,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
