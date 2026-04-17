import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { listResignedEmployees } from "@/lib/repositories/hr-employee.repository";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const data = await listResignedEmployees(guard.tenantId);
    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/employees/resigned]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
