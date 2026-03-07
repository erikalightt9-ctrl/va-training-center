import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations/profile.schema";

/* ------------------------------------------------------------------ */
/*  GET — Authenticated student's profile data                         */
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
        bio: true,
        avatarUrl: true,
        createdAt: true,
        enrollment: {
          select: {
            fullName: true,
            educationalBackground: true,
            technicalSkills: true,
            toolsFamiliarity: true,
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
        bio: student.bio,
        avatarUrl: student.avatarUrl,
        createdAt: student.createdAt.toISOString(),
        enrollmentFullName: student.enrollment.fullName,
        educationalBackground: student.enrollment.educationalBackground,
        technicalSkills: student.enrollment.technicalSkills,
        toolsFamiliarity: student.enrollment.toolsFamiliarity,
        courseTitle: student.enrollment.course.title,
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/profile]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH — Update student profile (name, bio)                         */
/* ------------------------------------------------------------------ */

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const updated = await prisma.student.update({
      where: { id: token.id as string },
      data: {
        name: parsed.data.name,
        bio: parsed.data.bio ?? null,
      },
      select: {
        name: true,
        bio: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { name: updated.name, bio: updated.bio },
      error: null,
    });
  } catch (err) {
    console.error("[PATCH /api/student/profile]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
