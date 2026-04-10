/**
 * GET  /api/admin/hr/settings  — fetch company name + logo
 * PATCH /api/admin/hr/settings — update company name and/or logo
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  companyName: z.string().min(1).max(200).optional(),
  logoUrl:     z.string().max(2_000_000).optional(), // supports base64 data URLs
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const org = await prisma.organization.findUnique({
      where:  { id: guard.tenantId },
      select: { name: true, logoUrl: true },
    });

    return NextResponse.json({ success: true, data: org, error: null });
  } catch (err) {
    console.error("[GET /api/admin/hr/settings]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body   = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const updated = await prisma.organization.update({
      where: { id: guard.tenantId },
      data:  {
        ...(parsed.data.companyName !== undefined && { name:    parsed.data.companyName }),
        ...(parsed.data.logoUrl     !== undefined && { logoUrl: parsed.data.logoUrl }),
      },
      select: { name: true, logoUrl: true },
    });

    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/hr/settings]", err);
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
