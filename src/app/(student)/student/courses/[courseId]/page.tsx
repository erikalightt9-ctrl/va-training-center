import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getLessonsByCourse,
  getLessonsByCourseTier,
  getCourseProgress,
  getCourseProgressByTier,
  getCompletedLessonIds,
} from "@/lib/repositories/lesson.repository";
import { getQuizzesByCourse } from "@/lib/repositories/quiz.repository";
import { prisma } from "@/lib/prisma";
import { COURSE_TIER_LABELS, COURSE_TIER_COLORS } from "@/lib/constants/course-tiers";
import type { CourseTier } from "@prisma/client";
import Link from "next/link";
import { CourseAttendanceButtons } from "@/components/student/CourseAttendanceButtons";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const studentId = (session?.user as { id: string } | undefined)?.id;
  if (!studentId) redirect("/student/login");

  const { courseId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { courseTier: true },
  });

  const studentTier: CourseTier | null = student?.courseTier ?? null;

  const [course, lessons, progress, completedIds, quizzes] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    studentTier
      ? getLessonsByCourseTier(courseId, studentTier)
      : getLessonsByCourse(courseId),
    studentTier
      ? getCourseProgressByTier(studentId, courseId, studentTier)
      : getCourseProgress(studentId, courseId),
    getCompletedLessonIds(studentId, courseId),
    getQuizzesByCourse(courseId),
  ]);

  if (!course) redirect("/student/dashboard");
  const completedSet = new Set(completedIds);

  const tierLabel = studentTier ? COURSE_TIER_LABELS[studentTier] : null;

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Title */}
      <div>
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-xl font-bold text-ds-text">{course.title}</h1>
          {tierLabel && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-300 border border-blue-800">
              {tierLabel} Tier
            </span>
          )}
        </div>
        <p className="text-ds-muted text-sm mt-1 leading-relaxed">{course.description}</p>
      </div>

      {/* Attendance */}
      <div className="bg-ds-card rounded-xl border border-ds-border p-5">
        <h2 className="font-semibold text-ds-text mb-3">Attendance</h2>
        <CourseAttendanceButtons courseId={courseId} />
      </div>

      {/* Progress */}
      <div className="bg-ds-card rounded-xl border border-ds-border p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ds-muted">Progress</span>
          <span className="text-sm font-bold text-ds-primary">{progress.percent}%</span>
        </div>
        <div className="w-full bg-ds-surface rounded-full h-2">
          <div
            className="bg-ds-primary h-2 rounded-full transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="text-xs text-ds-muted mt-2">
          {progress.completed} of {progress.total} lessons completed
        </p>
      </div>

      {/* Lessons */}
      <div className="bg-ds-card rounded-xl border border-ds-border p-5">
        <h2 className="font-semibold text-ds-text mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-ds-primary" />
          Lessons
        </h2>
        {lessons.length === 0 ? (
          <p className="text-ds-muted text-sm">No lessons published yet.</p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, idx) => {
              const done = completedSet.has(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-ds-border hover:border-ds-primary/50 hover:bg-ds-surface/50 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    done
                      ? "bg-emerald-900/40 text-emerald-400"
                      : "bg-ds-surface text-ds-muted"
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ds-text group-hover:text-blue-300 transition-colors truncate">
                      {lesson.title}
                    </div>
                    {lesson.durationMin > 0 && (
                      <div className="text-xs text-ds-muted flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />{lesson.durationMin} min
                      </div>
                    )}
                  </div>
                  {done && (
                    <span className="text-xs text-emerald-400 font-medium shrink-0">Done</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quizzes */}
      {quizzes.length > 0 && (
        <div className="bg-ds-card rounded-xl border border-ds-border p-5">
          <h2 className="font-semibold text-ds-text mb-3">Quizzes</h2>
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-ds-border hover:border-ds-primary/50 hover:bg-ds-surface/50 transition-all group"
              >
                <span className="text-sm font-medium text-ds-text group-hover:text-blue-300 transition-colors">
                  {quiz.title}
                </span>
                <span className="text-xs text-ds-muted">{quiz._count.questions} questions</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
