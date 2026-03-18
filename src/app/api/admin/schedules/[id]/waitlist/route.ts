import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import {
  listWaitlistBySchedule,
  promoteNextWaitlistEntry,
  cancelWaitlistEntry,
} from "@/lib/repositories/waitlist.repository";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/schedules/[id]/waitlist                             */
/*  Returns WAITING entries for a schedule                            */
/* ------------------------------------------------------------------ */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const guard = requireAdmin(token);
  if (!guard.ok) return guard.response;

  const { id: scheduleId } = await params;
  const entries = await listWaitlistBySchedule(scheduleId, "WAITING");
  return NextResponse.json({ success: true, data: entries });
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/schedules/[id]/waitlist                            */
/*  Body: { action: "promote" | "cancel", enrollmentId }              */
/* ------------------------------------------------------------------ */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const guard = requireAdmin(token);
  if (!guard.ok) return guard.response;

  const { id: scheduleId } = await params;
  const body = await req.json();
  const { action, enrollmentId } = body;

  if (action === "promote") {
    const promoted = await promoteNextWaitlistEntry(scheduleId);
    if (!promoted) {
      return NextResponse.json(
        { success: false, error: "No waiting entries to promote" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: promoted });
  }

  if (action === "cancel") {
    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, error: "enrollmentId is required for cancel action" },
        { status: 400 },
      );
    }
    const cancelled = await cancelWaitlistEntry(scheduleId, enrollmentId);
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: "Waitlist entry not found or already processed" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: cancelled });
  }

  return NextResponse.json(
    { success: false, error: "action must be 'promote' or 'cancel'" },
    { status: 400 },
  );
}
