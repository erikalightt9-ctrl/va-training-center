import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const vehicleSchema = z.object({
  name:        z.string().min(1).max(200),
  plateNumber: z.string().max(50).default(""),
  vehicleType: z.string().max(100).default("Van"),
  driver:      z.string().max(150).optional().nullable(),
  status:      z.string().default("ACTIVE"),
  notes:       z.string().optional().nullable(),
});

const deliverySchema = z.object({
  title:       z.string().min(1).max(200),
  vehicleId:   z.string().optional().nullable(),
  origin:      z.string().min(1).max(300),
  destination: z.string().min(1).max(300),
  scheduledAt: z.string(),
  deliveredAt: z.string().optional().nullable(),
  driver:      z.string().max(150).optional().nullable(),
  cargo:       z.string().optional().nullable(),
  status:      z.enum(["SCHEDULED","IN_TRANSIT","DELIVERED","CANCELLED"]).default("SCHEDULED"),
  notes:       z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const tab    = searchParams.get("tab") ?? "vehicles";
    const status = searchParams.get("status") ?? undefined;

    if (tab === "deliveries") {
      const data = await prisma.adminDelivery.findMany({
        where: { organizationId: guard.tenantId, ...(status && { status: status as never }) },
        include: { vehicle: { select: { id: true, name: true, plateNumber: true } } },
        orderBy: { scheduledAt: "desc" },
      });
      return NextResponse.json({ success: true, data, error: null });
    }

    if (searchParams.get("stats") === "1") {
      const [vehicles, scheduled, inTransit, delivered] = await Promise.all([
        prisma.adminVehicle.count({ where: { organizationId: guard.tenantId, status: "ACTIVE" } }),
        prisma.adminDelivery.count({ where: { organizationId: guard.tenantId, status: "SCHEDULED" } }),
        prisma.adminDelivery.count({ where: { organizationId: guard.tenantId, status: "IN_TRANSIT" } }),
        prisma.adminDelivery.count({ where: { organizationId: guard.tenantId, status: "DELIVERED" } }),
      ]);
      return NextResponse.json({ success: true, data: { vehicles, scheduled, inTransit, delivered }, error: null });
    }

    const data = await prisma.adminVehicle.findMany({
      where: { organizationId: guard.tenantId, ...(status && { status: status as never }) },
      orderBy: { name: "asc" },
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
    const tab  = new URL(request.url).searchParams.get("tab") ?? "vehicles";

    if (tab === "deliveries") {
      const parsed = deliverySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
      const record = await prisma.adminDelivery.create({
        data: { id: createId(), organizationId: guard.tenantId, ...parsed.data, scheduledAt: new Date(parsed.data.scheduledAt), ...(parsed.data.deliveredAt ? { deliveredAt: new Date(parsed.data.deliveredAt) } : {}) },
        include: { vehicle: { select: { id: true, name: true, plateNumber: true } } },
      });
      return NextResponse.json({ success: true, data: record, error: null }, { status: 201 });
    }

    const parsed = vehicleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    const record = await prisma.adminVehicle.create({ data: { id: createId(), organizationId: guard.tenantId, ...parsed.data } });
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
    const id  = searchParams.get("id");
    const tab = searchParams.get("tab") ?? "vehicles";
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    if (tab === "deliveries") {
      const existing = await prisma.adminDelivery.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      const parsed = deliverySchema.partial().safeParse(await request.json());
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
      const updated = await prisma.adminDelivery.update({
        where: { id },
        data: { ...parsed.data, ...(parsed.data.scheduledAt ? { scheduledAt: new Date(parsed.data.scheduledAt) } : {}), updatedAt: new Date() },
        include: { vehicle: { select: { id: true, name: true, plateNumber: true } } },
      });
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    const existing = await prisma.adminVehicle.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
    const parsed = vehicleSchema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    const updated = await prisma.adminVehicle.update({ where: { id }, data: { ...parsed.data, updatedAt: new Date() } });
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

    const { searchParams } = new URL(request.url);
    const id  = searchParams.get("id");
    const tab = searchParams.get("tab") ?? "vehicles";
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    if (tab === "deliveries") {
      await prisma.adminDelivery.deleteMany({ where: { id, organizationId: guard.tenantId } });
    } else {
      await prisma.adminVehicle.deleteMany({ where: { id, organizationId: guard.tenantId } });
    }
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
