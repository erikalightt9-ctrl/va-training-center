import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getStudentAnalytics } from "@/lib/repositories/learning-analytics.repository";

/* ------------------------------------------------------------------ */
/*  GET — Return learning analytics for the authenticated student      */
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
    const analytics = await getStudentAnalytics(studentId);

    if (!analytics) {
      return NextResponse.json(
        { success: false, data: null, error: "Student not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/learning-analytics]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
