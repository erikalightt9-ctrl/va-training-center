import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function listAttendance(
  employeeId: string,
  filters: { dateFrom?: Date; dateTo?: Date; page?: number; limit?: number }
) {
  const page  = filters.page  ?? 1;
  const limit = filters.limit ?? 31;

  const where: Prisma.HrAttendanceLogWhereInput = {
    employeeId,
    ...(filters.dateFrom && { date: { gte: filters.dateFrom } }),
    ...(filters.dateTo   && { date: { lte: filters.dateTo   } }),
  };

  const [data, total] = await Promise.all([
    prisma.hrAttendanceLog.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.hrAttendanceLog.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function listOrgAttendance(
  organizationId: string,
  date: Date
) {
  return prisma.hrAttendanceLog.findMany({
    where: {
      date,
      employee: { organizationId },
    },
    include: {
      employee: {
        select: { firstName: true, lastName: true, employeeNumber: true, position: true, department: true },
      },
    },
    orderBy: { employee: { lastName: "asc" } },
  });
}

export async function clockIn(employeeId: string, organizationId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Verify employee belongs to org
  const emp = await prisma.hrEmployee.findFirst({ where: { id: employeeId, organizationId } });
  if (!emp) throw new Error("Employee not found");

  const existing = await prisma.hrAttendanceLog.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });
  if (existing?.clockIn) throw new Error("Already clocked in today");

  const now = new Date();
  // Late if after 8:30 AM
  const lateThreshold = new Date(today);
  lateThreshold.setHours(8, 30, 0, 0);
  const status = now > lateThreshold ? "LATE" : "PRESENT";

  return prisma.hrAttendanceLog.upsert({
    where: { employeeId_date: { employeeId, date: today } },
    update: { clockIn: now, status: status as never },
    create: { employeeId, date: today, clockIn: now, status: status as never },
  });
}

export async function clockOut(employeeId: string, organizationId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const emp = await prisma.hrEmployee.findFirst({ where: { id: employeeId, organizationId } });
  if (!emp) throw new Error("Employee not found");

  const log = await prisma.hrAttendanceLog.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });
  if (!log?.clockIn) throw new Error("No clock-in found for today");
  if (log.clockOut)  throw new Error("Already clocked out today");

  const now = new Date();
  const hoursWorked = (now.getTime() - log.clockIn!.getTime()) / 3600000;
  const regularHours = Math.min(hoursWorked, 8);
  const overtimeHours = Math.max(hoursWorked - 8, 0);

  return prisma.hrAttendanceLog.update({
    where: { id: log.id },
    data: {
      clockOut:     now,
      hoursWorked:  new Prisma.Decimal(regularHours),
      overtimeHours: new Prisma.Decimal(overtimeHours),
    },
  });
}

export async function getAttendanceSummary(
  organizationId: string,
  employeeId: string,
  dateFrom: Date,
  dateTo: Date
) {
  const logs = await prisma.hrAttendanceLog.findMany({
    where: {
      employeeId,
      employee: { organizationId },
      date: { gte: dateFrom, lte: dateTo },
    },
  });

  const present  = logs.filter((l) => l.status === "PRESENT").length;
  const late     = logs.filter((l) => l.status === "LATE").length;
  const absent   = logs.filter((l) => l.status === "ABSENT").length;
  const halfDay  = logs.filter((l) => l.status === "HALF_DAY").length;
  const totalHours    = logs.reduce((s, l) => s + Number(l.hoursWorked    ?? 0), 0);
  const overtimeHours = logs.reduce((s, l) => s + Number(l.overtimeHours  ?? 0), 0);

  return { present, late, absent, halfDay, totalHours, overtimeHours, logs };
}
