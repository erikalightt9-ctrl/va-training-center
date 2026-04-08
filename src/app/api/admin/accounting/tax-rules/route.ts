import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAccountingWrite, requireAccountingRead } from "@/lib/auth-guards";
import {
  listTaxRules,
  createTaxRule,
  seedDefaultPhTaxRules,
} from "@/lib/repositories/acc-bir.repository";

const createSchema = z.object({
  code:        z.string().min(2).max(40),
  name:        z.string().min(2).max(150),
  rate:        z.number().nonnegative().max(100),
  taxType:     z.enum(["VAT", "WITHHOLDING", "INCOME"]),
  description: z.string().max(300).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAccountingRead(token);
    if (!guard.ok) return guard.response;

    const rules = await listTaxRules(guard.tenantId);
    return NextResponse.json({ success: true, data: rules, error: null });
  } catch (err) {
    console.error("[GET /api/admin/accounting/tax-rules]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAccountingWrite(token);
    if (!guard.ok) return guard.response;

    const body = await request.json();

    // Allow seeding default PH rules with a special action
    if (body.action === "seed_defaults") {
      await seedDefaultPhTaxRules(guard.tenantId);
      const rules = await listTaxRules(guard.tenantId);
      return NextResponse.json({ success: true, data: rules, error: null }, { status: 201 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.message },
        { status: 400 }
      );
    }

    const rule = await createTaxRule(guard.tenantId, parsed.data);
    return NextResponse.json({ success: true, data: rule, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/accounting/tax-rules]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const status  = message.includes("Unique constraint") ? 409 : 500;
    return NextResponse.json({ success: false, data: null, error: message }, { status });
  }
}
