import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const fuelSchema = z.object({
  vehicleInfo:   z.string().min(1).max(200),
  date:          z.string(),
  liters:        z.number().min(0),
  pricePerLiter: z.number().min(0).optional(),
  totalCost:     z.number().min(0).optional(),
  odometer:      z.number().int().min(0).optional(),
  driver:        z.string().max(150).optional(),
  station:       z.string().max(200).optional(),
});

const maintSchema = z.object({
  vehicleInfo:     z.string().min(1).max(200),
  date:            z.string(),
  maintenanceType: z.string().min(1).max(100),
  description:     z.string().optional(),
  cost:            z.number().min(0).optional(),
  odometer:        z.number().int().min(0).optional(),
  shop:            z.string().max(200).optional(),
  nextServiceDate: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const vehicle = searchParams.get("vehicle") ?? "";
    const month   = searchParams.get("month")   ?? "";

    let dateFilter: { gte?: Date; lte?: Date } = {};
    if (month) {
      const [y, m] = month.split("-").map(Number);
      dateFilter = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }

    const [fuelLogs, maintLogs] = await Promise.all([
      prisma.adminFuelLog.findMany({
        where: {
          organizationId: guard.tenantId,
          ...(vehicle ? { vehicleInfo: { contains: vehicle, mode: "insensitive" } } : {}),
          ...(month ? { date: dateFilter } : {}),
        },
        orderBy: { date: "desc" },
      }),
      prisma.adminCarMaintenance.findMany({
        where: {
          organizationId: guard.tenantId,
          ...(vehicle ? { vehicleInfo: { contains: vehicle, mode: "insensitive" } } : {}),
          ...(month ? { date: dateFilter } : {}),
        },
        orderBy: { date: "desc" },
      }),
    ]);

    const allVehicles = [
      ...new Set([
        ...fuelLogs.map((f) => f.vehicleInfo),
        ...maintLogs.map((m) => m.vehicleInfo),
      ]),
    ].sort();

    const totalFuelCost    = fuelLogs.reduce((s, f) => s + Number(f.totalCost ?? 0), 0);
    const totalMaintCost   = maintLogs.reduce((s, m) => s + Number(m.cost ?? 0), 0);
    const totalLiters      = fuelLogs.reduce((s, f) => s + Number(f.liters), 0);

    return NextResponse.json({
      success: true,
      data: {
        fuelLogs,
        maintLogs,
        vehicles: allVehicles,
        kpis: {
          totalVehicles:   allVehicles.length,
          totalFuelLogs:   fuelLogs.length,
          totalMaintLogs:  maintLogs.length,
          totalLiters:     Number(totalLiters.toFixed(2)),
          totalFuelCost:   Number(totalFuelCost.toFixed(2)),
          totalMaintCost:  Number(totalMaintCost.toFixed(2)),
        },
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/admin/office-admin/fuel-maintenance]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const type = body.type as "fuel" | "maintenance";

    if (type === "fuel") {
      const parsed = fuelSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

      const { date, ...rest } = parsed.data;
      const log = await prisma.adminFuelLog.create({
        data: { id: createId(), organizationId: guard.tenantId, date: new Date(date), ...rest },
      });
      return NextResponse.json({ success: true, data: log, error: null }, { status: 201 });
    } else {
      const parsed = maintSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

      const { date, nextServiceDate, ...rest } = parsed.data;
      const log = await prisma.adminCarMaintenance.create({
        data: {
          id: createId(),
          organizationId: guard.tenantId,
          date: new Date(date),
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
          ...rest,
        },
      });
      return NextResponse.json({ success: true, data: log, error: null }, { status: 201 });
    }
  } catch (err) {
    console.error("[POST /api/admin/office-admin/fuel-maintenance]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body = await request.json();
    const { id, type, ...fields } = body as { id: string; type: "fuel" | "maintenance"; [k: string]: unknown };
    if (!id || !type) return NextResponse.json({ success: false, data: null, error: "Missing id or type" }, { status: 400 });

    if (type === "fuel") {
      const existing = await prisma.adminFuelLog.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      const updateData: Record<string, unknown> = {};
      if (fields.vehicleInfo   !== undefined) updateData.vehicleInfo   = String(fields.vehicleInfo);
      if (fields.date          !== undefined) updateData.date          = new Date(String(fields.date));
      if (fields.liters        !== undefined) updateData.liters        = parseFloat(String(fields.liters)) || 0;
      if (fields.pricePerLiter !== undefined) updateData.pricePerLiter = fields.pricePerLiter ? parseFloat(String(fields.pricePerLiter)) : null;
      if (fields.totalCost     !== undefined) updateData.totalCost     = fields.totalCost     ? parseFloat(String(fields.totalCost))     : null;
      if (fields.odometer      !== undefined) updateData.odometer      = fields.odometer      ? parseInt(String(fields.odometer))        : null;
      if (fields.driver        !== undefined) updateData.driver        = fields.driver        ? String(fields.driver)        : null;
      if (fields.station       !== undefined) updateData.station       = fields.station       ? String(fields.station)       : null;
      const log = await prisma.adminFuelLog.update({ where: { id }, data: updateData });
      return NextResponse.json({ success: true, data: log, error: null });
    } else {
      const existing = await prisma.adminCarMaintenance.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      const updateData: Record<string, unknown> = {};
      if (fields.vehicleInfo     !== undefined) updateData.vehicleInfo     = String(fields.vehicleInfo);
      if (fields.date            !== undefined) updateData.date            = new Date(String(fields.date));
      if (fields.maintenanceType !== undefined) updateData.maintenanceType = String(fields.maintenanceType);
      if (fields.description     !== undefined) updateData.description     = fields.description     ? String(fields.description)     : null;
      if (fields.cost            !== undefined) updateData.cost            = fields.cost            ? parseFloat(String(fields.cost))  : null;
      if (fields.odometer        !== undefined) updateData.odometer        = fields.odometer        ? parseInt(String(fields.odometer)) : null;
      if (fields.shop            !== undefined) updateData.shop            = fields.shop            ? String(fields.shop)            : null;
      if (fields.nextServiceDate !== undefined) updateData.nextServiceDate = fields.nextServiceDate ? new Date(String(fields.nextServiceDate)) : null;
      const log = await prisma.adminCarMaintenance.update({ where: { id }, data: updateData });
      return NextResponse.json({ success: true, data: log, error: null });
    }
  } catch (err) {
    console.error("[PATCH /api/admin/office-admin/fuel-maintenance]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const id   = searchParams.get("id");
    const type = searchParams.get("type") as "fuel" | "maintenance";
    if (!id || !type) return NextResponse.json({ success: false, data: null, error: "Missing id or type" }, { status: 400 });

    if (type === "fuel") {
      const existing = await prisma.adminFuelLog.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      await prisma.adminFuelLog.delete({ where: { id } });
    } else {
      const existing = await prisma.adminCarMaintenance.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      await prisma.adminCarMaintenance.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/admin/office-admin/fuel-maintenance]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
