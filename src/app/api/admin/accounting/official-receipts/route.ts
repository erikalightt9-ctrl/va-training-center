import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAccountingRead } from "@/lib/auth-guards";
import { listOfficialReceipts } from "@/lib/repositories/acc-bir.repository";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAccountingRead(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const result = await listOfficialReceipts(guard.tenantId, {
      invoiceId: searchParams.get("invoiceId") ?? undefined,
      status:    searchParams.get("status")    ?? undefined,
      page:      searchParams.get("page")  ? Number(searchParams.get("page"))  : undefined,
      limit:     searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    });

    return NextResponse.json({ success: true, data: result, error: null });
  } catch (err) {
    console.error("[GET /api/admin/accounting/official-receipts]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
