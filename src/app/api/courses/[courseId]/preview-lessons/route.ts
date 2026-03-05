import { NextRequest, NextResponse } from "next/server";
import { getPreviewLessons } from "@/lib/repositories/lesson.repository";

/* ------------------------------------------------------------------ */
/*  GET  /api/courses/[courseId]/preview-lessons                        */
/*  Public endpoint — no auth required                                 */
/*  Returns published lessons marked as free preview (no content)      */
/* ------------------------------------------------------------------ */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const lessons = await getPreviewLessons(courseId);
    return NextResponse.json({ success: true, data: lessons, error: null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load preview lessons";
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 },
    );
  }
}
