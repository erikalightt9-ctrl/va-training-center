import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { markPayrollPaid } from "@/lib/repositories/hr-payroll.repository";

const schema = z.object({ payDate: z.string() });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body   = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const run = await markPayrollPaid(
      guard.tenantId, id,
      (token as { id?: string }).id ?? "",
      new Date(parsed.data.payDate)
    );
    return NextResponse.json({ success: true, data: run, error: null });
  } catch (err) {
    console.error("[POST /api/admin/hr/payroll/[id]/pay]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("not found") ? 404 : message.includes("Only APPROVED") ? 422 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
