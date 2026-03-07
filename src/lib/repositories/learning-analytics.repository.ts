import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RecentActivityItem {
  readonly id: string;
  readonly type: "lesson" | "quiz" | "assignment" | "attendance" | "points";
  readonly title: string;
  readonly detail: string;
  readonly timestamp: Date;
}

interface WeeklyLessonData {
  readonly weekLabel: string;
  readonly count: number;
}

interface QuizScoreData {
  readonly quizTitle: string;
  readonly score: number;
  readonly completedAt: Date;
}

export interface StudentAnalytics {
  readonly totalLessonsCompleted: number;
  readonly totalLessons: number;
  readonly avgQuizScore: number;
  readonly totalQuizzes: number;
  readonly assignmentsCompleted: number;
  readonly totalAssignments: number;
  readonly totalStudyHours: number;
  readonly totalPoints: number;
  readonly recentActivity: ReadonlyArray<RecentActivityItem>;
  readonly weeklyLessons: ReadonlyArray<WeeklyLessonData>;
  readonly quizScores: ReadonlyArray<QuizScoreData>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getWeekLabel(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

function computeStudyHours(
  records: ReadonlyArray<{
    readonly clockIn: Date;
    readonly clockOut: Date | null;
  }>,
): number {
  let totalMs = 0;
  for (const record of records) {
    const end = record.clockOut ?? new Date();
    const diff = end.getTime() - record.clockIn.getTime();
    if (diff > 0) {
      totalMs += diff;
    }
  }
  return Math.round((totalMs / 3_600_000) * 10) / 10;
}

/* ------------------------------------------------------------------ */
/*  Main query                                                         */
/* ------------------------------------------------------------------ */

export async function getStudentAnalytics(
  studentId: string,
): Promise<StudentAnalytics | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      enrollment: { select: { courseId: true } },
    },
  });

  if (!student) return null;

  const courseId = student.enrollment.courseId;

  /* 8-week boundary for weekly lessons chart */
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const [
    lessonsCompleted,
    totalLessons,
    quizAgg,
    totalQuizzes,
    assignmentsCompleted,
    totalAssignments,
    attendanceRecords,
    pointsAgg,
    recentCompletions,
    recentAttempts,
    recentSubmissions,
    recentAttendance,
    recentPoints,
    weeklyCompletions,
    quizScoresRaw,
  ] = await Promise.all([
    /* Counts */
    prisma.lessonCompletion.count({
      where: { studentId, lesson: { courseId, isPublished: true } },
    }),
    prisma.lesson.count({
      where: { courseId, isPublished: true },
    }),
    prisma.quizAttempt.aggregate({
      where: { studentId, quiz: { courseId } },
      _avg: { score: true },
    }),
    prisma.quizAttempt.count({
      where: { studentId, quiz: { courseId } },
    }),
    prisma.submission.count({
      where: {
        studentId,
        assignment: { courseId },
        status: { in: ["GRADED", "PENDING"] },
      },
    }),
    prisma.assignment.count({
      where: { courseId, isPublished: true },
    }),

    /* Study hours from attendance */
    prisma.attendanceRecord.findMany({
      where: { studentId },
      select: { clockIn: true, clockOut: true },
    }),

    /* Total points */
    prisma.pointTransaction.aggregate({
      where: { studentId },
      _sum: { points: true },
    }),

    /* Recent activity: last 3 from each model */
    prisma.lessonCompletion.findMany({
      where: { studentId },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: { lesson: { select: { title: true } } },
    }),
    prisma.quizAttempt.findMany({
      where: { studentId },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: { quiz: { select: { title: true } } },
    }),
    prisma.submission.findMany({
      where: { studentId },
      orderBy: { submittedAt: "desc" },
      take: 3,
      include: { assignment: { select: { title: true } } },
    }),
    prisma.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { clockIn: "desc" },
      take: 3,
    }),
    prisma.pointTransaction.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),

    /* Weekly lessons (last 8 weeks) */
    prisma.lessonCompletion.findMany({
      where: {
        studentId,
        completedAt: { gte: eightWeeksAgo },
      },
      select: { completedAt: true },
      orderBy: { completedAt: "asc" },
    }),

    /* Last 10 quiz scores */
    prisma.quizAttempt.findMany({
      where: { studentId, quiz: { courseId } },
      orderBy: { completedAt: "asc" },
      take: 10,
      include: { quiz: { select: { title: true } } },
    }),
  ]);

  /* Build recent activity (merged, sorted, limit 10) */
  const activityItems: RecentActivityItem[] = [];

  for (const c of recentCompletions) {
    activityItems.push({
      id: `lesson-${c.id}`,
      type: "lesson",
      title: c.lesson.title,
      detail: "Completed lesson",
      timestamp: c.completedAt,
    });
  }

  for (const a of recentAttempts) {
    activityItems.push({
      id: `quiz-${a.id}`,
      type: "quiz",
      title: a.quiz.title,
      detail: `Scored ${a.score}%${a.passed ? " (Passed)" : " (Failed)"}`,
      timestamp: a.completedAt,
    });
  }

  for (const s of recentSubmissions) {
    activityItems.push({
      id: `assignment-${s.id}`,
      type: "assignment",
      title: s.assignment.title,
      detail:
        s.status === "GRADED"
          ? `Graded: ${s.grade ?? 0}%`
          : "Submitted",
      timestamp: s.submittedAt,
    });
  }

  for (const att of recentAttendance) {
    activityItems.push({
      id: `attendance-${att.id}`,
      type: "attendance",
      title: "Study Session",
      detail: att.clockOut ? "Completed session" : "Clocked in",
      timestamp: att.clockIn,
    });
  }

  for (const p of recentPoints) {
    activityItems.push({
      id: `points-${p.id}`,
      type: "points",
      title: `+${p.points} Points`,
      detail: p.reason,
      timestamp: p.createdAt,
    });
  }

  activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentActivity = activityItems.slice(0, 10);

  /* Build weekly lessons data (last 8 weeks) */
  const weeklyLessons: WeeklyLessonData[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = weeklyCompletions.filter((c) => {
      const t = c.completedAt.getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    }).length;

    weeklyLessons.push({
      weekLabel: getWeekLabel(weekStart),
      count,
    });
  }

  /* Build quiz scores */
  const quizScores: QuizScoreData[] = quizScoresRaw.map((q) => ({
    quizTitle: q.quiz.title,
    score: q.score,
    completedAt: q.completedAt,
  }));

  return {
    totalLessonsCompleted: lessonsCompleted,
    totalLessons,
    avgQuizScore: Math.round(quizAgg._avg.score ?? 0),
    totalQuizzes,
    assignmentsCompleted,
    totalAssignments,
    totalStudyHours: computeStudyHours(attendanceRecords),
    totalPoints: pointsAgg._sum.points ?? 0,
    recentActivity,
    weeklyLessons,
    quizScores,
  };
}
