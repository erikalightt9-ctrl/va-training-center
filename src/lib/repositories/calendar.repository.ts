import { prisma } from "@/lib/prisma";
import type { CalendarEvent, EventType } from "@prisma/client";

// ── Types ──────────────────────────────────────────────────────────
export interface CalendarEventWithCourse extends CalendarEvent {
  course: { id: string; title: string } | null;
}

export interface UnifiedCalendarItem {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  endDate: Date | null;
  type: EventType | "ASSIGNMENT";
  courseId: string | null;
  source: "event" | "assignment";
}

// ── Admin: CRUD ────────────────────────────────────────────────────
export async function getEventsByDateRange(
  startDate: Date,
  endDate: Date,
  courseId?: string | null,
): Promise<ReadonlyArray<CalendarEventWithCourse>> {
  return prisma.calendarEvent.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      ...(courseId ? { OR: [{ courseId }, { courseId: null }] } : {}),
    },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { date: "asc" },
  });
}

export async function getUpcomingEvents(
  days: number,
  courseId?: string | null,
): Promise<ReadonlyArray<CalendarEventWithCourse>> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return prisma.calendarEvent.findMany({
    where: {
      date: { gte: now, lte: future },
      isPublished: true,
      ...(courseId ? { OR: [{ courseId }, { courseId: null }] } : {}),
    },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { date: "asc" },
    take: 10,
  });
}

export async function getEventById(
  id: string,
): Promise<CalendarEventWithCourse | null> {
  return prisma.calendarEvent.findUnique({
    where: { id },
    include: { course: { select: { id: true, title: true } } },
  });
}

export async function createEvent(data: {
  title: string;
  description?: string | null;
  date: Date;
  endDate?: Date | null;
  type: EventType;
  courseId?: string | null;
  createdBy: string;
  isPublished: boolean;
}): Promise<CalendarEvent> {
  return prisma.calendarEvent.create({ data });
}

export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    description: string | null;
    date: Date;
    endDate: Date | null;
    type: EventType;
    courseId: string | null;
    isPublished: boolean;
  }>,
): Promise<CalendarEvent> {
  return prisma.calendarEvent.update({ where: { id }, data });
}

export async function deleteEvent(id: string): Promise<void> {
  await prisma.calendarEvent.delete({ where: { id } });
}

// ── Student: Merged Calendar ───────────────────────────────────────
export async function getAssignmentDueDates(
  courseId: string,
  startDate: Date,
  endDate: Date,
): Promise<ReadonlyArray<{ id: string; title: string; dueDate: Date; maxPoints: number }>> {
  const assignments = await prisma.assignment.findMany({
    where: {
      courseId,
      isPublished: true,
      dueDate: { not: null, gte: startDate, lte: endDate },
    },
    select: { id: true, title: true, dueDate: true, maxPoints: true },
    orderBy: { dueDate: "asc" },
  });

  return assignments
    .filter((a): a is typeof a & { dueDate: Date } => a.dueDate !== null)
    .map((a) => ({ id: a.id, title: a.title, dueDate: a.dueDate, maxPoints: a.maxPoints }));
}

export async function getMergedStudentCalendar(
  courseId: string,
  startDate: Date,
  endDate: Date,
): Promise<ReadonlyArray<UnifiedCalendarItem>> {
  const [events, assignments] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        isPublished: true,
        OR: [{ courseId }, { courseId: null }],
      },
      orderBy: { date: "asc" },
    }),
    getAssignmentDueDates(courseId, startDate, endDate),
  ]);

  const unified: UnifiedCalendarItem[] = [
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: e.date,
      endDate: e.endDate,
      type: e.type as EventType,
      courseId: e.courseId,
      source: "event" as const,
    })),
    ...assignments.map((a) => ({
      id: a.id,
      title: `Assignment: ${a.title}`,
      description: `Due — ${a.maxPoints} pts`,
      date: a.dueDate,
      endDate: null,
      type: "ASSIGNMENT" as const,
      courseId,
      source: "assignment" as const,
    })),
  ];

  return unified.sort((a, b) => a.date.getTime() - b.date.getTime());
}
