import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { listLeaveRequests, createLeaveRequest } from "@/lib/repositories/hr-leave.repository";

const createSchema = z.object({
  employeeId: z.string(),
  leaveType:  z.enum(["SICK","VACATION","EMERGENCY","MATERNITY","PATERNITY","BEREAVEMENT","OTHER"]),
  startDate:  z.string(),
  endDate:    z.string(),
  reason:     z.string().min(5).max(500),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const result = await listLeaveRequests(guard.tenantId, {
      employeeId: searchParams.get("employeeId") ?? undefined,
      status:     searchParams.get("status")     ?? undefined,
      leaveType:  searchParams.get("leaveType")  ?? undefined,
      page:       searchParams.get("page")  ? Number(searchParams.get("page"))  : undefined,
      limit:      searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    });

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/leave]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body   = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const req = await createLeaveRequest(guard.tenantId, {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate:   new Date(parsed.data.endDate),
    });

    return NextResponse.json({ success: true, data: req, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/hr/leave]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
