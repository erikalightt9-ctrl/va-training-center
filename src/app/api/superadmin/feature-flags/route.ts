import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ALL_FEATURES = [
  "ai_tools", "white_label", "custom_domain", "file_manager",
  "reports_export", "corporate_portal", "api_access", "sso", "analytics_advanced",
] as const;

async function assertSuperAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.id || token.role !== "superadmin") return null;
  return token;
}

/* ------------------------------------------------------------------ */
/*  GET — List all tenants with their feature flags                   */
/* ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  try {
    if (!await assertSuperAdmin(request)) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const tenants = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        plan: true,
        featureFlags: {
          select: { feature: true, enabled: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = tenants.map((t) => {
      const flags: Record<string, boolean> = {};
      for (const key of ALL_FEATURES) { flags[key] = false; }
      for (const ff of t.featureFlags) { flags[ff.feature] = ff.enabled; }
      return {
        tenantId: t.id,
        tenantName: t.name,
        subdomain: t.subdomain,
        plan: t.plan,
        flags,
      };
    });

    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    console.error("[GET /api/superadmin/feature-flags]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH — Toggle a flag for a tenant                                */
/* ------------------------------------------------------------------ */

const patchSchema = z.object({
  tenantId: z.string().min(1),
  flag: z.enum(ALL_FEATURES),
  enabled: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  try {
    if (!await assertSuperAdmin(request)) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, error: parsed.error.issues[0].message },
        { status: 422 },
      );
    }

    const { tenantId, flag, enabled } = parsed.data;

    await prisma.tenantFeatureFlag.upsert({
      where: { tenantId_feature: { tenantId, feature: flag } },
      create: { tenantId, feature: flag, enabled },
      update: { enabled },
    });

    return NextResponse.json({ success: true, data: { tenantId, flag, enabled }, error: null });
  } catch (err) {
    console.error("[PATCH /api/superadmin/feature-flags]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
