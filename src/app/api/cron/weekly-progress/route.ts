import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCourseProgress } from "@/lib/repositories/lesson.repository";
import { sendWeeklyProgress } from "@/lib/services/notification.service";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const students = await prisma.student.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        enrollment: {
          select: {
            courseId: true,
            course: { select: { title: true } },
          },
        },
      },
    });

    let sent = 0;

    for (const student of students) {
      const courseId = student.enrollment.courseId;
      const progress = await getCourseProgress(student.id, courseId);

      // Skip students who already completed the course
      if (progress.percent === 100) continue;

      sendWeeklyProgress({
        name: student.name,
        email: student.email,
        courseTitle: student.enrollment.course.title,
        completedLessons: progress.completed,
        totalLessons: progress.total,
        progressPercent: progress.percent,
      });

      sent++;
    }

    return NextResponse.json({
      success: true,
      data: { emailsSent: sent, totalStudents: students.length },
      error: null,
    });
  } catch (err) {
    console.error("[POST /api/cron/weekly-progress]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
