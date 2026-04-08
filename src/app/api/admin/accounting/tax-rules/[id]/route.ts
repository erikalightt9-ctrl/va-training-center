import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAccountingWrite } from "@/lib/auth-guards";
import { updateTaxRule } from "@/lib/repositories/acc-bir.repository";

const updateSchema = z.object({
  name:        z.string().min(2).max(150).optional(),
  rate:        z.number().nonnegative().max(100).optional(),
  taxType:     z.enum(["VAT", "WITHHOLDING", "INCOME"]).optional(),
  description: z.string().max(300).optional(),
  isActive:    z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAccountingWrite(token);
    if (!guard.ok) return guard.response;

    const { id } = await params;
    const body   = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.message },
        { status: 400 }
      );
    }

    const rule = await updateTaxRule(guard.tenantId, id, parsed.data);
    return NextResponse.json({ success: true, data: rule, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/accounting/tax-rules/[id]]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
