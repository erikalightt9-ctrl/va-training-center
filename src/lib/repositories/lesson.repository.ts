import { prisma } from "@/lib/prisma";
import type { Lesson, LessonCompletion, CourseTier } from "@prisma/client";

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  return prisma.lesson.findMany({
    where: { courseId, isPublished: true },
    orderBy: { order: "asc" },
  });
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  return prisma.lesson.findUnique({ where: { id } });
}

export async function createLesson(data: {
  courseId: string;
  title: string;
  content: string;
  order: number;
  durationMin?: number;
  isPublished?: boolean;
  isFreePreview?: boolean;
  tier?: CourseTier;
  videoUrl?: string | null;
}): Promise<Lesson> {
  return prisma.lesson.create({ data });
}

export async function updateLesson(id: string, data: Partial<{
  title: string;
  content: string;
  order: number;
  durationMin: number;
  isPublished: boolean;
  isFreePreview: boolean;
  tier: CourseTier;
  videoUrl: string | null;
}>): Promise<Lesson> {
  return prisma.lesson.update({ where: { id }, data });
}

export async function deleteLesson(id: string): Promise<void> {
  await prisma.lesson.delete({ where: { id } });
}

export async function markLessonComplete(
  studentId: string,
  lessonId: string
): Promise<LessonCompletion> {
  return prisma.lessonCompletion.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    create: { studentId, lessonId },
    update: { completedAt: new Date() },
  });
}

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
}

export async function getCourseProgress(
  studentId: string,
  courseId: string
): Promise<CourseProgress> {
  const [total, completions] = await Promise.all([
    prisma.lesson.count({ where: { courseId, isPublished: true } }),
    prisma.lessonCompletion.count({
      where: {
        studentId,
        lesson: { courseId },
      },
    }),
  ]);
  const percent = total === 0 ? 0 : Math.round((completions / total) * 100);
  return { completed: completions, total, percent };
}

export async function getCompletedLessonIds(
  studentId: string,
  courseId: string
): Promise<string[]> {
  const completions = await prisma.lessonCompletion.findMany({
    where: { studentId, lesson: { courseId } },
    select: { lessonId: true },
  });
  return completions.map((c) => c.lessonId);
}

export async function getAllLessonsByCourse(courseId: string): Promise<Lesson[]> {
  return prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });
}

/* ------------------------------------------------------------------ */
/*  Free Preview                                                       */
/* ------------------------------------------------------------------ */

export interface PreviewLesson {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly durationMin: number;
}

export async function getPreviewLessons(courseId: string): Promise<PreviewLesson[]> {
  return prisma.lesson.findMany({
    where: { courseId, isPublished: true, isFreePreview: true },
    select: { id: true, title: true, order: true, durationMin: true },
    orderBy: { order: "asc" },
  });
}

export async function getPreviewLessonById(lessonId: string): Promise<Lesson | null> {
  return prisma.lesson.findFirst({
    where: { id: lessonId, isPublished: true, isFreePreview: true },
  });
}

export interface CourseCurriculumItem {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly durationMin: number;
  readonly isFreePreview: boolean;
}

export async function getCourseCurriculum(courseId: string): Promise<CourseCurriculumItem[]> {
  return prisma.lesson.findMany({
    where: { courseId, isPublished: true },
    select: { id: true, title: true, order: true, durationMin: true, isFreePreview: true },
    orderBy: { order: "asc" },
  });
}

/* ------------------------------------------------------------------ */
/*  Tier-filtered queries                                              */
/* ------------------------------------------------------------------ */

export async function getLessonsByCourseTier(
  courseId: string,
  tier: CourseTier,
): Promise<Lesson[]> {
  return prisma.lesson.findMany({
    where: { courseId, tier, isPublished: true },
    orderBy: { order: "asc" },
  });
}

export async function getAllLessonsByCourseTier(
  courseId: string,
  tier: CourseTier,
): Promise<Lesson[]> {
  return prisma.lesson.findMany({
    where: { courseId, tier },
    orderBy: { order: "asc" },
  });
}

export async function getCourseProgressByTier(
  studentId: string,
  courseId: string,
  tier: CourseTier,
): Promise<CourseProgress> {
  const [total, completions] = await Promise.all([
    prisma.lesson.count({ where: { courseId, tier, isPublished: true } }),
    prisma.lessonCompletion.count({
      where: {
        studentId,
        lesson: { courseId, tier },
      },
    }),
  ]);
  const percent = total === 0 ? 0 : Math.round((completions / total) * 100);
  return { completed: completions, total, percent };
}

/* ------------------------------------------------------------------ */
/*  Bulk create (for AI generation)                                    */
/* ------------------------------------------------------------------ */

interface BulkLessonInput {
  readonly courseId: string;
  readonly title: string;
  readonly content: string;
  readonly order: number;
  readonly durationMin: number;
  readonly tier: CourseTier;
  readonly isPublished?: boolean;
  readonly isFreePreview?: boolean;
}

export async function bulkCreateLessons(
  lessons: readonly BulkLessonInput[],
): Promise<{ readonly count: number }> {
  return prisma.lesson.createMany({
    data: lessons.map((l) => ({
      courseId: l.courseId,
      title: l.title,
      content: l.content,
      order: l.order,
      durationMin: l.durationMin,
      tier: l.tier,
      isPublished: l.isPublished ?? false,
      isFreePreview: l.isFreePreview ?? false,
    })),
  });
}
