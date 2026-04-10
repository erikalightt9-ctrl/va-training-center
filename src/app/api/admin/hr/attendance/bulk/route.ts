/**
 * POST /api/admin/hr/attendance/bulk
 *
 * Saves an array of extracted attendance rows.
 * Matches employees by employeeNumber first, then by partial name.
 * Upserts HrAttendanceLog records.
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const rowSchema = z.object({
  employeeNumber: z.string().nullable().optional(),
  employeeName:   z.string().nullable().optional(),
  date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockIn:        z.string().nullable().optional(),
  clockOut:       z.string().nullable().optional(),
  status:         z.enum(["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"]),
  hoursWorked:    z.number().nullable().optional(),
  overtimeHours:  z.number().nullable().optional(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1),
});

function toDateTime(dateStr: string, timeStr: string | null | undefined): Date | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body   = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    // Load all employees for matching
    const employees = await prisma.hrEmployee.findMany({
      where: { organizationId: guard.tenantId },
      select: { id: true, employeeNumber: true, firstName: true, lastName: true },
    });

    const byNumber = new Map(employees.map((e) => [e.employeeNumber.toLowerCase(), e]));

    let saved   = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of parsed.data.rows) {
      try {
        // Match employee
        let emp = row.employeeNumber
          ? byNumber.get(row.employeeNumber.toLowerCase().trim())
          : undefined;

        // Fallback: match by name (lastName, firstName or "First Last")
        if (!emp && row.employeeName) {
          const q = row.employeeName.toLowerCase().trim();
          emp = employees.find((e) => {
            const full1 = `${e.firstName} ${e.lastName}`.toLowerCase();
            const full2 = `${e.lastName} ${e.firstName}`.toLowerCase();
            const full3 = `${e.lastName}, ${e.firstName}`.toLowerCase();
            return full1 === q || full2 === q || full3 === q ||
              e.lastName.toLowerCase() === q || full1.includes(q) || full2.includes(q);
          });
        }

        if (!emp) {
          skipped++;
          errors.push(`No match for: ${row.employeeNumber ?? ""} ${row.employeeName ?? ""}`.trim());
          continue;
        }

        const date     = new Date(`${row.date}T00:00:00`);
        const clockIn  = toDateTime(row.date, row.clockIn);
        const clockOut = toDateTime(row.date, row.clockOut);

        // Compute hours if not provided
        let hoursWorked  = row.hoursWorked ?? null;
        let overtimeHours = row.overtimeHours ?? null;
        if (!hoursWorked && clockIn && clockOut) {
          const total = (clockOut.getTime() - clockIn.getTime()) / 3600000;
          hoursWorked   = Math.min(total, 8);
          overtimeHours = Math.max(total - 8, 0);
        }

        await prisma.hrAttendanceLog.upsert({
          where: { employeeId_date: { employeeId: emp.id, date } },
          update: {
            clockIn:      clockIn,
            clockOut:     clockOut,
            hoursWorked:  hoursWorked  != null ? new Prisma.Decimal(hoursWorked)  : null,
            overtimeHours: overtimeHours != null ? new Prisma.Decimal(overtimeHours) : null,
            status:       row.status as never,
          },
          create: {
            employeeId:   emp.id,
            date,
            clockIn,
            clockOut,
            hoursWorked:  hoursWorked  != null ? new Prisma.Decimal(hoursWorked)  : null,
            overtimeHours: overtimeHours != null ? new Prisma.Decimal(overtimeHours) : null,
            status:       row.status as never,
          },
        });
        saved++;
      } catch (rowErr) {
        skipped++;
        errors.push(rowErr instanceof Error ? rowErr.message : "Row error");
      }
    }

    return NextResponse.json({
      success: true,
      data: { saved, skipped, errors: errors.slice(0, 20) },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/admin/hr/attendance/bulk]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
