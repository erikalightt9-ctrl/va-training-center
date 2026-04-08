import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAccountingWrite } from "@/lib/auth-guards";
import { issueOfficialReceipt } from "@/lib/repositories/acc-bir.repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAccountingWrite(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const or = await issueOfficialReceipt(guard.tenantId, id, guard.userId);
    return NextResponse.json({ success: true, data: or, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/accounting/invoices/[id]/issue-or]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("not found") ? 404 : message.includes("only be issued") || message.includes("already exists") ? 422 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
