import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAttendanceByDate } from "@/lib/repositories/attendance.repository";

/* ------------------------------------------------------------------ */
/*  GET  /api/admin/attendance?date=YYYY-MM-DD                         */
/*  Returns attendance records for a given date (defaults to today)    */
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

  const date = request.nextUrl.searchParams.get("date") ?? undefined;

  try {
    const summary = await getAttendanceByDate(date);
    return NextResponse.json({ success: true, data: summary, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load attendance";
    return NextResponse.json(
      { success: false, data: null, error: message },
      { status: 500 },
    );
  }
}
