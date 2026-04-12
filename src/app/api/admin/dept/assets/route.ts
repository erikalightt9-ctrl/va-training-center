import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const upsertSchema = z.object({
  name:           z.string().min(1).max(200),
  assetTag:       z.string().max(50).optional(),
  assetType:      z.enum(["FURNITURE","APPLIANCE","MACHINE","EQUIPMENT","VEHICLE","OTHER"]).optional(),
  status:         z.enum(["ACTIVE","FOR_REPAIR","IN_REPAIR","FOR_DISPOSE","DISPOSED","UNDER_WARRANTY"]).optional(),
  location:       z.string().max(200).optional(),
  purchaseDate:   z.string().optional(),
  purchaseValue:  z.number().positive().optional(),
  warrantyExpiry: z.string().optional(),
  serialNumber:   z.string().max(100).optional(),
  notes:          z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);

    if (searchParams.get("stats") === "1") {
      const [total, forRepair, forDispose, underWarranty] = await Promise.all([
        prisma.adminAsset.count({ where: { organizationId: guard.tenantId } }),
        prisma.adminAsset.count({ where: { organizationId: guard.tenantId, status: "FOR_REPAIR" } }),
        prisma.adminAsset.count({ where: { organizationId: guard.tenantId, status: "FOR_DISPOSE" } }),
        prisma.adminAsset.count({ where: { organizationId: guard.tenantId, status: "UNDER_WARRANTY" } }),
      ]);
      return NextResponse.json({ success: true, data: { total, forRepair, forDispose, underWarranty }, error: null });
    }

    const type   = searchParams.get("type")   ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    const data = await prisma.adminAsset.findMany({
      where: {
        organizationId: guard.tenantId,
        ...(type   && { assetType: type   as never }),
        ...(status && { status:    status as never }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = upsertSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const { purchaseDate, warrantyExpiry, ...rest } = parsed.data;
    const asset = await prisma.adminAsset.create({
      data: { id: createId(), organizationId: guard.tenantId, ...rest, purchaseDate: purchaseDate ? new Date(purchaseDate) : null, warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null },
    });
    return NextResponse.json({ success: true, data: asset, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    const existing = await prisma.adminAsset.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const parsed = upsertSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const { purchaseDate, warrantyExpiry, ...rest } = parsed.data;
    const updated = await prisma.adminAsset.update({
      where: { id },
      data: { ...rest, purchaseDate: purchaseDate ? new Date(purchaseDate) : null, warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null, updatedAt: new Date() },
    });
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
