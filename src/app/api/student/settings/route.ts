import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET — Authenticated student's settings data                        */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: token.id as string },
      select: {
        name: true,
        email: true,
        portfolioPublic: true,
        createdAt: true,
        enrollment: {
          select: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, data: null, error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: student.name,
        email: student.email,
        portfolioPublic: student.portfolioPublic,
        createdAt: student.createdAt.toISOString(),
        courseTitle: student.enrollment.course.title,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/settings]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
