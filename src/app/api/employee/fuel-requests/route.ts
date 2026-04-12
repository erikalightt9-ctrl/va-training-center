import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createId } from "@paralleldrive/cuid2";

const createSchema = z.object({
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  vehicleInfo: z.string().max(200).optional(),
  odometer:    z.number().int().min(0).optional(),
  liters:      z.number().positive().max(9999),
  purpose:     z.string().min(1).max(300),
});

async function getEmployeeFromToken(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "employee") return null;
  return prisma.hrEmployee.findFirst({
    where: { email: token.email as string, organizationId: token.organizationId as string },
  });
}

export async function GET(request: NextRequest) {
  try {
    const employee = await getEmployeeFromToken(request);
    if (!employee) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.hrFuelRequest.findMany({
      where:   { employeeId: employee.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: requests, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const employee = await getEmployeeFromToken(request);
    if (!employee) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    if ((employee.portalRole as string) !== "DRIVER") {
      return NextResponse.json({ success: false, data: null, error: "Only drivers can submit fuel requests" }, { status: 403 });
    }

    const body   = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const { date, vehicleInfo, odometer, liters, purpose } = parsed.data;

    const fuelRequest = await prisma.hrFuelRequest.create({
      data: {
        id:          createId(),
        employeeId:  employee.id,
        date:        new Date(date),
        vehicleInfo: vehicleInfo ?? null,
        odometer:    odometer    ?? null,
        liters:      liters,
        purpose,
        status:      "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: fuelRequest, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
