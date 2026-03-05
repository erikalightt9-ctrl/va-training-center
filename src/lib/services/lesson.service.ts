import { markLessonComplete, getCourseProgress, getLessonById, getLessonsByCourse } from "@/lib/repositories/lesson.repository";
import { checkAndIssueCertificate } from "@/lib/services/certificate.service";
import { onLessonComplete, onCourseCompleted } from "@/lib/services/gamification.service";
import { sendLessonCompleted, sendCourseCompleted } from "@/lib/services/notification.service";
import { prisma } from "@/lib/prisma";
import type { LessonCompletion, Certificate } from "@prisma/client";

export interface LessonCompleteResult {
  completion: LessonCompletion;
  certificate: Certificate | null;
  pointsAwarded: number;
}

export async function completeLessonForStudent(
  studentId: string,
  lessonId: string
): Promise<LessonCompleteResult> {
  const lesson = await getLessonById(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  const completion = await markLessonComplete(studentId, lessonId);
  await onLessonComplete(studentId, lesson.courseId);

  const progress = await getCourseProgress(studentId, lesson.courseId);
  let certificate: Certificate | null = null;

  // Send lesson completion notification (non-blocking)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { name: true, email: true },
  });
  const course = await prisma.course.findUnique({
    where: { id: lesson.courseId },
    select: { title: true },
  });

  if (student && course) {
    const lessons = await getLessonsByCourse(lesson.courseId);
    const currentIndex = lessons.findIndex((l) => l.id === lessonId);
    const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;

    sendLessonCompleted({
      name: student.name,
      email: student.email,
      lessonTitle: lesson.title,
      courseTitle: course.title,
      courseId: lesson.courseId,
      nextLessonTitle: nextLesson?.title,
    });
  }

  if (progress.percent === 100) {
    certificate = await checkAndIssueCertificate(studentId, lesson.courseId);
    if (certificate) {
      await onCourseCompleted(studentId, lesson.courseId);

      // Send course completion notification (non-blocking)
      if (student && course) {
        sendCourseCompleted({
          name: student.name,
          email: student.email,
          courseTitle: course.title,
          certNumber: certificate.certNumber,
        });
      }
    }
  }

  return { completion, certificate, pointsAwarded: 10 };
}
