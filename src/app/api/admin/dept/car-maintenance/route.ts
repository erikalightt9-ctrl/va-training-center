import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  vehicleInfo:     z.string().min(1).max(200),
  date:            z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maintenanceType: z.string().min(1).max(100),
  description:     z.string().optional(),
  cost:            z.number().min(0).optional(),
  odometer:        z.number().int().min(0).optional(),
  shop:            z.string().max(200).optional(),
  nextServiceDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const data = await prisma.adminCarMaintenance.findMany({
      where: { organizationId: guard.tenantId },
      orderBy: { date: "desc" },
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

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const { date, nextServiceDate, ...rest } = parsed.data;
    const record = await prisma.adminCarMaintenance.create({
      data: { id: createId(), organizationId: guard.tenantId, ...rest, date: new Date(date), nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null },
    });
    return NextResponse.json({ success: true, data: record, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
