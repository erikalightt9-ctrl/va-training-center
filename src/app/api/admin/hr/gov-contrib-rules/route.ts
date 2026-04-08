import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { listGovContribRules, createGovContribRule, seedDefaultPhGovRules } from "@/lib/repositories/hr-payroll.repository";

const createSchema = z.object({
  contributionType: z.enum(["SSS", "PHILHEALTH", "PAGIBIG", "INCOME_TAX"]),
  salaryFrom:       z.number().nonnegative(),
  salaryTo:         z.number().positive().optional(),
  employeeShare:    z.number().nonnegative(),
  employerShare:    z.number().nonnegative(),
  ruleKind:         z.enum(["FIXED", "RATE"]),
  effectiveDate:    z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const rules = await listGovContribRules(guard.tenantId);
    return NextResponse.json({ success: true, data: rules, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/gov-contrib-rules]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body = await request.json();
    if (body.action === "seed_defaults") {
      await seedDefaultPhGovRules(guard.tenantId);
      const rules = await listGovContribRules(guard.tenantId);
      return NextResponse.json({ success: true, data: rules, error: null }, { status: 201 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const rule = await createGovContribRule(guard.tenantId, {
      ...parsed.data,
      effectiveDate: new Date(parsed.data.effectiveDate),
    });

    return NextResponse.json({ success: true, data: rule, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/hr/gov-contrib-rules]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
