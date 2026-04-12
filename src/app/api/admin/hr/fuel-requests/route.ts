import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import type { JWT } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  id:         z.string(),
  status:     z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().max(300).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const page   = searchParams.get("page")  ? Number(searchParams.get("page"))  : 1;
    const limit  = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

    const where = {
      employee: { organizationId: guard.tenantId },
      ...(status && { status: status as never }),
    };

    const [data, total] = await Promise.all([
      prisma.hrFuelRequest.findMany({
        where,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.hrFuelRequest.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { data, total, page, limit }, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }) as JWT | null;
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body   = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    }

    const { id, status, reviewNote } = parsed.data;

    // Verify the fuel request belongs to this org
    const existing = await prisma.hrFuelRequest.findFirst({
      where: { id, employee: { organizationId: guard.tenantId } },
    });
    if (!existing) {
      return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.hrFuelRequest.update({
      where: { id },
      data: {
        status,
        reviewNote:   reviewNote ?? null,
        reviewedById: token?.id ?? null,
        reviewedAt:   new Date(),
        updatedAt:    new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    return NextResponse.json(
      { success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
