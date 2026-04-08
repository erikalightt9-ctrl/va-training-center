import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { getPayrollRunById } from "@/lib/repositories/hr-payroll.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const run = await getPayrollRunById(guard.tenantId, id);
    if (!run) return NextResponse.json({ success: false, data: null, error: "Payroll run not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: run, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/payroll/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
