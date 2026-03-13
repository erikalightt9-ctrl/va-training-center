import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import {
  getCourseProgress,
  getCourseProgressByTier,
} from "@/lib/repositories/lesson.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id || token.role !== "student") {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }
    const studentId = token.id as string;
    const { courseId } = await params;

    // Look up the student's enrolled course tier
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { courseTier: true },
    });

    const progress = student?.courseTier
      ? await getCourseProgressByTier(studentId, courseId, student.courseTier)
      : await getCourseProgress(studentId, courseId);

    return NextResponse.json({ success: true, data: progress, error: null });
  } catch (err) {
    console.error("[GET /api/student/courses/[courseId]/progress]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
