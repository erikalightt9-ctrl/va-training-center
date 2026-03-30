import { NextRequest, NextResponse } from "next/server";
import { enrollmentSchema } from "@/lib/validations/enrollment.schema";
import { processEnrollment } from "@/lib/services/enrollment.service";
import { prisma } from "@/lib/prisma";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Resolve tenant from subdomain header (set by middleware)
    const tenantSubdomain = request.headers.get("x-tenant-subdomain");
    let resolvedTenantId: string | null = null;
    if (tenantSubdomain) {
      try {
        const org = await prisma.organization.findUnique({
          where: { subdomain: tenantSubdomain, isActive: true },
          select: { id: true },
        });
        resolvedTenantId = org?.id ?? null;
      } catch {
        // Non-fatal: proceed without tenant context
      }
    }

    // Validate
    const result = enrollmentSchema.safeParse({ ...body, tenantId: resolvedTenantId });
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const ip = getClientIp(request);
    const outcome = await processEnrollment(result.data, ip, resolvedTenantId);

    if (!outcome.success) {
      const statusMap = {
        EMAIL_LIMIT_REACHED: 409,
        RATE_LIMITED: 429,
        VALIDATION_ERROR: 422,
      };
      return NextResponse.json(
        { success: false, data: null, error: outcome.message },
        { status: statusMap[outcome.code] }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { id: outcome.enrollment.id },
        error: null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/enrollments]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
