import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { clockIn } from "@/lib/repositories/hr-attendance.repository";

const schema = z.object({ employeeId: z.string() });

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const log = await clockIn(parsed.data.employeeId, guard.tenantId);
    return NextResponse.json({ success: true, data: log, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/hr/attendance/clock-in]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("not found") ? 404 : message.includes("Already") ? 422 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
