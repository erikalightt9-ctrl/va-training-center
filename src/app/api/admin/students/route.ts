import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { listActiveStudents } from "@/lib/repositories/student-management.repository";
import type { ActiveStudentFilters } from "@/lib/repositories/student-management.repository";

/* ------------------------------------------------------------------ */
/*  GET  /api/admin/students                                           */
/*  Returns paginated active students with progress data               */
/*  Query params: ?search=, ?courseId=, ?page=, ?limit=                */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id || token.role !== "admin") {
    return NextResponse.json(
      { success: false, data: null, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const params = request.nextUrl.searchParams;

  const filters: ActiveStudentFilters = {
    search: params.get("search") ?? undefined,
    courseId: params.get("courseId") ?? undefined,
    page: params.has("page") ? parseInt(params.get("page")!, 10) : 1,
    limit: params.has("limit") ? parseInt(params.get("limit")!, 10) : 20,
  };

  try {
    const result = await listActiveStudents(filters);
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load students";
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 },
    );
  }
}
