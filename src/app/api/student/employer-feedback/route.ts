import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getStudentFeedback } from "@/lib/repositories/employer-feedback.repository";

/* ------------------------------------------------------------------ */
/*  GET — Return all employer feedback for the authenticated student   */
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
    const feedback = await getStudentFeedback(studentId);

    return NextResponse.json({
      success: true,
      data: feedback,
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/student/employer-feedback]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 },
    );
  }
}
