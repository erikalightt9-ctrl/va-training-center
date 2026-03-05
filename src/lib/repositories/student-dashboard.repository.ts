import { prisma } from "@/lib/prisma";

interface CourseProgress {
  readonly completed: number;
  readonly total: number;
  readonly percent: number;
}

interface NextLesson {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly durationMin: number;
}

interface ActivityItem {
  readonly id: string;
  readonly type: "lesson" | "quiz" | "submission";
  readonly title: string;
  readonly detail: string;
  readonly timestamp: Date;
}

interface UpcomingAssignment {
  readonly id: string;
  readonly title: string;
  readonly dueDate: Date | null;
  readonly maxPoints: number;
}

export interface StudentDashboardData {
  readonly courseProgress: CourseProgress;
  readonly quizAverage: number;
  readonly assignmentsSubmitted: number;
  readonly totalAssignments: number;
  readonly totalPoints: number;
  readonly nextLesson: NextLesson | null;
  readonly recentActivity: ReadonlyArray<ActivityItem>;
  readonly upcomingAssignments: ReadonlyArray<UpcomingAssignment>;
}

export async function getStudentDashboardData(
  studentId: string,
  courseId: string,
): Promise<StudentDashboardData> {
  const [
    completedCount,
    totalLessonsCount,
    quizAgg,
    submittedCount,
    totalAssignmentsCount,
    pointsAgg,
    nextLessonResult,
    recentCompletions,
    recentAttempts,
    recentSubmissions,
    upcomingAssignmentsResult,
  ] = await Promise.all([
    // Lessons completed
    prisma.lessonCompletion.count({
      where: {
        studentId,
        lesson: { courseId, isPublished: true },
      },
    }),

    // Total published lessons
    prisma.lesson.count({
      where: { courseId, isPublished: true },
    }),

    // Quiz average score
    prisma.quizAttempt.aggregate({
      where: {
        studentId,
        quiz: { courseId },
      },
      _avg: { score: true },
    }),

    // Assignments submitted
    prisma.submission.count({
      where: {
        studentId,
        assignment: { courseId },
      },
    }),

    // Total published assignments
    prisma.assignment.count({
      where: { courseId, isPublished: true },
    }),

    // Total points
    prisma.pointTransaction.aggregate({
      where: { studentId },
      _sum: { points: true },
    }),

    // Next incomplete lesson (first published lesson not yet completed)
    prisma.lesson.findFirst({
      where: {
        courseId,
        isPublished: true,
        completions: {
          none: { studentId },
        },
      },
      orderBy: { order: "asc" },
      select: { id: true, title: true, order: true, durationMin: true },
    }),

    // Recent lesson completions (last 5)
    prisma.lessonCompletion.findMany({
      where: { studentId, lesson: { courseId } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        completedAt: true,
        lesson: { select: { title: true } },
      },
    }),

    // Recent quiz attempts (last 5)
    prisma.quizAttempt.findMany({
      where: { studentId, quiz: { courseId } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        score: true,
        passed: true,
        completedAt: true,
        quiz: { select: { title: true } },
      },
    }),

    // Recent submissions (last 5)
    prisma.submission.findMany({
      where: { studentId, assignment: { courseId } },
      orderBy: { submittedAt: "desc" },
      take: 5,
      select: {
        id: true,
        submittedAt: true,
        grade: true,
        status: true,
        assignment: { select: { title: true } },
      },
    }),

    // Upcoming assignments (not yet submitted by this student)
    prisma.assignment.findMany({
      where: {
        courseId,
        isPublished: true,
        submissions: {
          none: { studentId },
        },
      },
      orderBy: { dueDate: "asc" },
      select: {
        id: true,
        title: true,
        dueDate: true,
        maxPoints: true,
      },
    }),
  ]);

  const percent =
    totalLessonsCount > 0
      ? Math.round((completedCount / totalLessonsCount) * 100)
      : 0;

  // Merge and sort recent activities by timestamp (newest first), take 5
  const allActivities: ActivityItem[] = [
    ...recentCompletions.map((c) => ({
      id: c.id,
      type: "lesson" as const,
      title: c.lesson.title,
      detail: "Completed lesson",
      timestamp: c.completedAt,
    })),
    ...recentAttempts.map((a) => ({
      id: a.id,
      type: "quiz" as const,
      title: a.quiz.title,
      detail: `Scored ${a.score}% ${a.passed ? "(Passed)" : "(Failed)"}`,
      timestamp: a.completedAt,
    })),
    ...recentSubmissions.map((s) => ({
      id: s.id,
      type: "submission" as const,
      title: s.assignment.title,
      detail:
        s.status === "GRADED"
          ? `Graded: ${s.grade}/100`
          : "Submitted for review",
      timestamp: s.submittedAt,
    })),
  ];

  allActivities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  return {
    courseProgress: {
      completed: completedCount,
      total: totalLessonsCount,
      percent,
    },
    quizAverage: Math.round(quizAgg._avg.score ?? 0),
    assignmentsSubmitted: submittedCount,
    totalAssignments: totalAssignmentsCount,
    totalPoints: pointsAgg._sum.points ?? 0,
    nextLesson: nextLessonResult,
    recentActivity: allActivities.slice(0, 5),
    upcomingAssignments: upcomingAssignmentsResult,
  };
}
