import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAccountingRead } from "@/lib/auth-guards";
import { getBirVatSummary } from "@/lib/repositories/acc-bir.repository";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAccountingRead(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const now       = new Date();
    const dateFrom  = new Date(searchParams.get("dateFrom") ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString());
    const dateTo    = new Date(searchParams.get("dateTo")   ?? new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString());

    const result = await getBirVatSummary(guard.tenantId, dateFrom, dateTo);
    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err) {
    console.error("[GET /api/admin/accounting/reports/bir-vat-summary]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
