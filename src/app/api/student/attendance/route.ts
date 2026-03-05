import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { clockActionSchema } from "@/lib/validations/attendance.schema";
import {
  getActiveSession,
  clockIn,
  clockOut,
} from "@/lib/repositories/attendance.repository";

/* ------------------------------------------------------------------ */
/*  GET  /api/student/attendance                                       */
/*  Returns the student's current clock-in status                      */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
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
  const session = await getActiveSession(studentId);

  return NextResponse.json({
    success: true,
    data: {
      isClockedIn: session !== null,
      session: session
        ? {
            id: session.id,
            clockIn: session.clockIn.toISOString(),
          }
        : null,
    },
    error: null,
  });
}

/* ------------------------------------------------------------------ */
/*  POST  /api/student/attendance                                      */
/*  { action: "clock-in" | "clock-out" }                               */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = clockActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid action. Use 'clock-in' or 'clock-out'." },
      { status: 422 },
    );
  }

  const { action } = parsed.data;

  if (action === "clock-in") {
    // Prevent double clock-in
    const existing = await getActiveSession(studentId);
    if (existing) {
      return NextResponse.json(
        { success: false, data: null, error: "Already clocked in" },
        { status: 409 },
      );
    }

    const record = await clockIn(studentId);
    return NextResponse.json({
      success: true,
      data: { id: record.id, clockIn: record.clockIn.toISOString() },
      error: null,
    });
  }

  // clock-out
  const activeSession = await getActiveSession(studentId);
  if (!activeSession) {
    return NextResponse.json(
      { success: false, data: null, error: "Not clocked in" },
      { status: 409 },
    );
  }

  const record = await clockOut(studentId, activeSession.id);
  return NextResponse.json({
    success: true,
    data: {
      id: record.id,
      clockIn: record.clockIn.toISOString(),
      clockOut: record.clockOut?.toISOString() ?? null,
    },
    error: null,
  });
}
