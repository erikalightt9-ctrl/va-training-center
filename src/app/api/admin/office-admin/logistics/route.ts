import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const vehicleSchema = z.object({
  name:        z.string().min(1).max(200),
  plateNumber: z.string().min(1).max(50),
  vehicleType: z.string().min(1).max(100),
  driver:      z.string().max(150).optional().nullable(),
  status:      z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
  notes:       z.string().optional().nullable(),
});

const deliverySchema = z.object({
  vehicleId:   z.string().optional().nullable(),
  title:       z.string().min(1).max(200),
  origin:      z.string().min(1).max(300),
  destination: z.string().min(1).max(300),
  scheduledAt: z.string(),
  driver:      z.string().max(150).optional().nullable(),
  status:      z.enum(["SCHEDULED", "IN_TRANSIT", "DELIVERED", "CANCELLED"]).default("SCHEDULED"),
  cargo:       z.string().optional().nullable(),
  notes:       z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource") ?? "deliveries";
    const status   = searchParams.get("status") ?? "";

    if (resource === "vehicles") {
      const vehicles = await prisma.adminVehicle.findMany({
        where: { organizationId: guard.tenantId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: vehicles, error: null });
    }

    const deliveries = await prisma.adminDelivery.findMany({
      where: {
        organizationId: guard.tenantId,
        ...(status && { status: status as never }),
      },
      include: { vehicle: { select: { name: true, plateNumber: true } } },
      orderBy: { scheduledAt: "desc" },
    });

    const counts = {
      SCHEDULED:  deliveries.filter((d) => d.status === "SCHEDULED").length,
      IN_TRANSIT: deliveries.filter((d) => d.status === "IN_TRANSIT").length,
      DELIVERED:  deliveries.filter((d) => d.status === "DELIVERED").length,
      CANCELLED:  deliveries.filter((d) => d.status === "CANCELLED").length,
    };

    return NextResponse.json({ success: true, data: deliveries, counts, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body = await request.json();

    if (body.resource === "vehicle") {
      const parsed = vehicleSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
      const data = await prisma.adminVehicle.create({ data: { id: createId(), organizationId: guard.tenantId, ...parsed.data } });
      return NextResponse.json({ success: true, data, error: null }, { status: 201 });
    }

    const parsed = deliverySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    const { scheduledAt, ...rest } = parsed.data;
    const data = await prisma.adminDelivery.create({
      data: { id: createId(), organizationId: guard.tenantId, scheduledAt: new Date(scheduledAt), ...rest },
    });
    return NextResponse.json({ success: true, data, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { id, resource, ...fields } = body;

    if (resource === "vehicle") {
      const existing = await prisma.adminVehicle.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      const data = await prisma.adminVehicle.update({ where: { id }, data: fields });
      return NextResponse.json({ success: true, data, error: null });
    }

    const existing = await prisma.adminDelivery.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = { ...fields };
    if (fields.scheduledAt) updateData.scheduledAt = new Date(fields.scheduledAt);
    if (fields.status === "DELIVERED" && !existing.deliveredAt) updateData.deliveredAt = new Date();

    const data = await prisma.adminDelivery.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const id       = searchParams.get("id");
    const resource = searchParams.get("resource") ?? "delivery";
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    if (resource === "vehicle") {
      await prisma.adminVehicle.deleteMany({ where: { id, organizationId: guard.tenantId } });
    } else {
      await prisma.adminDelivery.deleteMany({ where: { id, organizationId: guard.tenantId } });
    }
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}
