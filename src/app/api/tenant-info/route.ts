/**
 * GET /api/tenant-info
 *
 * Public endpoint — returns tenant branding config for a given subdomain.
 * Consumed by the frontend to bootstrap tenant-aware UI without a full page load.
 *
 * Query params:
 *   ?subdomain=tenantA   → look up by subdomain
 *   ?slug=tenantA        → alias for subdomain
 *
 * Response shape (matches the blueprint spec):
 *   { name, logo, primary_color, secondary_color, tagline, subdomain, siteName }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const subdomain = searchParams.get("subdomain") ?? searchParams.get("slug") ?? "";

  if (!subdomain) {
    return NextResponse.json(
      { success: false, data: null, error: "subdomain param is required" },
      { status: 400 },
    );
  }

  const org = await prisma.organization.findFirst({
    where: {
      OR: [{ subdomain }, { slug: subdomain }],
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      subdomain: true,
      siteName: true,
      tagline: true,
      logoUrl: true,
      faviconUrl: true,
      bannerImageUrl: true,
      primaryColor: true,
      secondaryColor: true,
      plan: true,
    },
  });

  if (!org) {
    return NextResponse.json(
      { success: false, data: null, error: "Tenant not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    error: null,
    data: {
      // Blueprint-compatible field names
      name: org.siteName ?? org.name,
      logo: org.logoUrl ?? null,
      primary_color: org.primaryColor ?? "#1E3A8A",
      secondary_color: org.secondaryColor ?? "#1E40AF",
      tagline: org.tagline ?? null,
      subdomain: org.subdomain ?? org.slug,
      // Extended fields
      siteName: org.siteName ?? org.name,
      faviconUrl: org.faviconUrl ?? null,
      bannerImageUrl: org.bannerImageUrl ?? null,
      plan: org.plan,
    },
  });
}
