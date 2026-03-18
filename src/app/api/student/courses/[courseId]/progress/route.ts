import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCourseProgressCached } from "@/lib/repositories/course-progress.repository";

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

    // Reads from the denormalized cache (tier-aware internally); falls back to
    // a live COUNT query on first visit before any lesson has been completed.
    const progress = await getCourseProgressCached(studentId, courseId);

    return NextResponse.json({ success: true, data: progress, error: null });
  } catch (err) {
    console.error("[GET /api/student/courses/[courseId]/progress]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
