import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { approvePayrollRun } from "@/lib/repositories/hr-payroll.repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const run = await approvePayrollRun(guard.tenantId, id, (token as { id?: string }).id ?? "");
    return NextResponse.json({ success: true, data: run, error: null });
  } catch (err) {
    console.error("[POST /api/admin/hr/payroll/[id]/approve]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("not found") ? 404 : message.includes("Only DRAFT") ? 422 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
