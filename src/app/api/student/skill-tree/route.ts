import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getStudentSkillData } from "@/lib/repositories/skill-tree.repository";

/* ------------------------------------------------------------------ */
/*  GET — Return student skill tree data                               */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id || token.role !== "student") {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const studentId = token.id as string;
    const skillData = await getStudentSkillData(studentId);

    if (!skillData) {
      return NextResponse.json(
        { success: false, data: null, error: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: skillData,
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/skill-tree]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
