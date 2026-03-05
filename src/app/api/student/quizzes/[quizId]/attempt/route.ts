import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { submitQuizAttempt } from "@/lib/repositories/quiz.repository";
import { onQuizPassed } from "@/lib/services/gamification.service";
import { sendQuizPassed } from "@/lib/services/notification.service";
import { prisma } from "@/lib/prisma";

const attemptSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id || token.role !== "student") {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }
    const studentId = token.id as string;
    const { quizId } = await params;
    const body = await request.json();
    const result = attemptSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, data: null, error: "Invalid request body" }, { status: 422 });
    }
    const attemptResult = await submitQuizAttempt(studentId, quizId, result.data.answers);
    if (attemptResult.passed) {
      await onQuizPassed(studentId);

      // Send quiz passed notification (non-blocking)
      const [student, quiz] = await Promise.all([
        prisma.student.findUnique({ where: { id: studentId }, select: { name: true, email: true } }),
        prisma.quiz.findUnique({
          where: { id: quizId },
          select: { title: true, passingScore: true, course: { select: { title: true } } },
        }),
      ]);

      if (student && quiz) {
        sendQuizPassed({
          name: student.name,
          email: student.email,
          quizTitle: quiz.title,
          courseTitle: quiz.course.title,
          score: attemptResult.score,
          passingScore: quiz.passingScore,
        });
      }
    }
    return NextResponse.json({ success: true, data: attemptResult, error: null });
  } catch (err) {
    console.error("[POST /api/student/quizzes/[quizId]/attempt]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
