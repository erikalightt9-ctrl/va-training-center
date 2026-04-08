import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAccountingWrite } from "@/lib/auth-guards";
import { voidOfficialReceipt } from "@/lib/repositories/acc-bir.repository";

const voidSchema = z.object({
  reason: z.string().min(5).max(300),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAccountingWrite(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body   = await request.json();
    const parsed = voidSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.message },
        { status: 400 }
      );
    }

    const or = await voidOfficialReceipt(guard.tenantId, id, parsed.data.reason, guard.userId);
    return NextResponse.json({ success: true, data: or, error: null });
  } catch (err) {
    console.error("[POST /api/admin/accounting/official-receipts/[id]/void]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("not found") ? 404 : message.includes("Already voided") ? 422 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
