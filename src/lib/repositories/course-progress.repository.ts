import { prisma } from "@/lib/prisma";
import type { CourseProgress } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CourseProgressData {
  readonly completed: number;
  readonly total: number;
  readonly percent: number;
  readonly lastActiveAt: Date | null;
  readonly completedAt: Date | null;
}

/* ------------------------------------------------------------------ */
/*  Upsert — recompute and persist progress after each completion      */
/*  Tier-aware: filters lessons to the student's enrolled tier.        */
/* ------------------------------------------------------------------ */

export async function upsertCourseProgress(
  studentId: string,
  courseId: string,
): Promise<CourseProgress> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { courseTier: true },
  });

  const tier = student?.courseTier ?? null;

  const [total, completed] = await Promise.all([
    prisma.lesson.count({
      where: {
        courseId,
        isPublished: true,
        ...(tier ? { tier } : {}),
      },
    }),
    prisma.lessonCompletion.count({
      where: {
        studentId,
        lesson: {
          courseId,
          ...(tier ? { tier } : {}),
        },
      },
    }),
  ]);

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const now = new Date();

  return prisma.courseProgress.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    create: {
      studentId,
      courseId,
      lessonsCompleted: completed,
      totalLessons: total,
      percentComplete: percent,
      lastActiveAt: now,
      completedAt: percent === 100 ? now : null,
    },
    update: {
      lessonsCompleted: completed,
      totalLessons: total,
      percentComplete: percent,
      lastActiveAt: now,
      // Only set completedAt once (first time it hits 100)
      ...(percent === 100
        ? { completedAt: { set: now } }
        : { completedAt: null }),
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Read — return cached progress, or fall back to live computation    */
/* ------------------------------------------------------------------ */

export async function getCourseProgressCached(
  studentId: string,
  courseId: string,
): Promise<CourseProgressData> {
  const cached = await prisma.courseProgress.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: {
      lessonsCompleted: true,
      totalLessons: true,
      percentComplete: true,
      lastActiveAt: true,
      completedAt: true,
    },
  });

  if (cached) {
    return {
      completed: cached.lessonsCompleted,
      total: cached.totalLessons,
      percent: cached.percentComplete,
      lastActiveAt: cached.lastActiveAt,
      completedAt: cached.completedAt,
    };
  }

  // No cache yet — compute live (first visit before any lesson is completed)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { courseTier: true },
  });

  const tier = student?.courseTier ?? null;

  const [total, completed] = await Promise.all([
    prisma.lesson.count({
      where: {
        courseId,
        isPublished: true,
        ...(tier ? { tier } : {}),
      },
    }),
    prisma.lessonCompletion.count({
      where: {
        studentId,
        lesson: {
          courseId,
          ...(tier ? { tier } : {}),
        },
      },
    }),
  ]);

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percent,
    lastActiveAt: null,
    completedAt: null,
  };
}

/* ------------------------------------------------------------------ */
/*  All finished courses for a student (for certificates page, etc.)  */
/* ------------------------------------------------------------------ */

export async function getCompletedCourses(
  studentId: string,
): Promise<ReadonlyArray<{ courseId: string; completedAt: Date }>> {
  const rows = await prisma.courseProgress.findMany({
    where: { studentId, completedAt: { not: null } },
    select: { courseId: true, completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  return rows.map((r) => ({
    courseId: r.courseId,
    completedAt: r.completedAt as Date,
  }));
}
