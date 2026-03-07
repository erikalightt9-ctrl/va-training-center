import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface SkillScore {
  readonly name: string;
  readonly score: number;
  readonly level: SkillLevel;
}

export interface StudentSkillData {
  readonly overallScore: number;
  readonly skills: ReadonlyArray<SkillScore>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getLevel(score: number): SkillLevel {
  if (score >= 76) return "Expert";
  if (score >= 51) return "Advanced";
  if (score >= 26) return "Intermediate";
  return "Beginner";
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/* ------------------------------------------------------------------ */
/*  Main query                                                         */
/* ------------------------------------------------------------------ */

export async function getStudentSkillData(
  studentId: string,
): Promise<StudentSkillData | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      enrollment: {
        select: { courseId: true },
      },
    },
  });

  if (!student) return null;

  const courseId = student.enrollment.courseId;

  const [
    careerScoreAgg,
    simulationCommAgg,
    lessonCompletionCount,
    totalLessonsCount,
    quizScoreAgg,
    simulationCount,
    interviewCount,
    interviewProfAgg,
    attendanceAgg,
  ] = await Promise.all([
    // Career readiness scores (latest)
    prisma.careerReadinessScore.findFirst({
      where: { studentId },
      orderBy: { evaluatedAt: "desc" },
      select: {
        communication: true,
        professionalism: true,
        speed: true,
      },
    }),

    // Simulation communication scores
    prisma.simulationSession.aggregate({
      where: { studentId, status: "completed", communicationScore: { not: null } },
      _avg: { communicationScore: true },
    }),

    // Lesson completions for student's course
    prisma.lessonCompletion.count({
      where: { studentId, lesson: { courseId, isPublished: true } },
    }),

    // Total lessons in course
    prisma.lesson.count({
      where: { courseId, isPublished: true },
    }),

    // Quiz attempt average scores
    prisma.quizAttempt.aggregate({
      where: { studentId },
      _avg: { score: true },
    }),

    // Simulation sessions completed
    prisma.simulationSession.count({
      where: { studentId, status: "completed" },
    }),

    // Interview sessions completed
    prisma.interviewSession.count({
      where: { studentId, status: "completed" },
    }),

    // Interview professionalism scores
    prisma.interviewSession.aggregate({
      where: { studentId, status: "completed", professionalismScore: { not: null } },
      _avg: { professionalismScore: true },
    }),

    // Attendance records with clock-out for hours calculation
    prisma.attendanceRecord.findMany({
      where: { studentId, clockOut: { not: null } },
      select: { clockIn: true, clockOut: true },
    }),
  ]);

  // --- Communication ---
  const careerComm = careerScoreAgg?.communication ?? 0;
  const simComm = simulationCommAgg._avg.communicationScore ?? 0;
  const commParts = [careerComm, simComm].filter((v) => v > 0);
  const communicationScore = clamp(
    commParts.length > 0
      ? commParts.reduce((a, b) => a + b, 0) / commParts.length
      : 0,
  );

  // --- Technical Skills ---
  const lessonPct =
    totalLessonsCount > 0
      ? (lessonCompletionCount / totalLessonsCount) * 100
      : 0;
  const quizAvg = quizScoreAgg._avg.score ?? 0;
  const technicalScore = clamp((lessonPct + quizAvg) / 2);

  // --- AI Tools ---
  const aiSessionsTotal = simulationCount + interviewCount;
  const aiToolsScore = clamp(Math.min(aiSessionsTotal * 10, 100));

  // --- Industry Knowledge ---
  const industryScore = clamp(quizAvg);

  // --- Professionalism ---
  const careerProf = careerScoreAgg?.professionalism ?? 0;
  const interviewProf = interviewProfAgg._avg.professionalismScore ?? 0;
  const profParts = [careerProf, interviewProf].filter((v) => v > 0);
  const professionalismScore = clamp(
    profParts.length > 0
      ? profParts.reduce((a, b) => a + b, 0) / profParts.length
      : 0,
  );

  // --- Speed ---
  const careerSpeed = careerScoreAgg?.speed ?? 0;
  const totalHours = attendanceAgg.reduce((sum, record) => {
    const clockOut = record.clockOut as Date;
    const diffMs = clockOut.getTime() - record.clockIn.getTime();
    return sum + diffMs / (1000 * 60 * 60);
  }, 0);
  const hoursPace = clamp(Math.min(totalHours * 2, 100));
  const speedParts = [careerSpeed, hoursPace].filter((v) => v > 0);
  const speedScore = clamp(
    speedParts.length > 0
      ? speedParts.reduce((a, b) => a + b, 0) / speedParts.length
      : 0,
  );

  // --- Build skills array ---
  const skills: ReadonlyArray<SkillScore> = [
    { name: "Communication", score: communicationScore, level: getLevel(communicationScore) },
    { name: "Technical Skills", score: technicalScore, level: getLevel(technicalScore) },
    { name: "AI Tools", score: aiToolsScore, level: getLevel(aiToolsScore) },
    { name: "Industry Knowledge", score: industryScore, level: getLevel(industryScore) },
    { name: "Professionalism", score: professionalismScore, level: getLevel(professionalismScore) },
    { name: "Speed", score: speedScore, level: getLevel(speedScore) },
  ];

  const overallScore = clamp(
    Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length),
  );

  return { overallScore, skills };
}
