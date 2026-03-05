import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AttendanceSession {
  readonly id: string;
  readonly studentId: string;
  readonly clockIn: Date;
  readonly clockOut: Date | null;
}

export interface AttendanceRow {
  readonly id: string;
  readonly studentName: string;
  readonly courseTitle: string;
  readonly clockIn: string;
  readonly clockOut: string | null;
  readonly isActive: boolean;
}

export interface AttendanceSummary {
  readonly presentNow: number;
  readonly clockedOutToday: number;
  readonly totalToday: number;
  readonly records: ReadonlyArray<AttendanceRow>;
}

/* ------------------------------------------------------------------ */
/*  Student-facing                                                     */
/* ------------------------------------------------------------------ */

/** Find a student's open (not clocked-out) session */
export async function getActiveSession(
  studentId: string,
): Promise<AttendanceSession | null> {
  return prisma.attendanceRecord.findFirst({
    where: { studentId, clockOut: null },
    orderBy: { clockIn: "desc" },
  });
}

/** Clock a student IN — creates a new attendance record */
export async function clockIn(studentId: string): Promise<AttendanceSession> {
  return prisma.attendanceRecord.create({
    data: { studentId },
  });
}

/** Clock a student OUT — stamps clockOut on their open session */
export async function clockOut(
  studentId: string,
  recordId: string,
): Promise<AttendanceSession> {
  return prisma.attendanceRecord.update({
    where: { id: recordId, studentId },
    data: { clockOut: new Date() },
  });
}

/* ------------------------------------------------------------------ */
/*  Admin-facing                                                       */
/* ------------------------------------------------------------------ */

/** Get attendance records for a specific date (defaults to today) */
export async function getAttendanceByDate(
  date?: string,
): Promise<AttendanceSummary> {
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      clockIn: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      student: {
        select: {
          name: true,
          enrollment: {
            select: { course: { select: { title: true } } },
          },
        },
      },
    },
    orderBy: { clockIn: "desc" },
  });

  const rows: AttendanceRow[] = records.map((r) => ({
    id: r.id,
    studentName: r.student.name,
    courseTitle: r.student.enrollment.course.title,
    clockIn: r.clockIn.toISOString(),
    clockOut: r.clockOut?.toISOString() ?? null,
    isActive: r.clockOut === null,
  }));

  const presentNow = rows.filter((r) => r.isActive).length;
  const clockedOutToday = rows.filter((r) => !r.isActive).length;

  return {
    presentNow,
    clockedOutToday,
    totalToday: rows.length,
    records: rows,
  };
}

/** Count students currently clocked in (for admin dashboard card) */
export async function getPresentNowCount(): Promise<number> {
  return prisma.attendanceRecord.count({
    where: { clockOut: null },
  });
}
