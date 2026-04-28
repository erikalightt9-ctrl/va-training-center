import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name:        z.string().min(1).max(200),
  category:    z.string().min(1).max(100).default("General"),
  quantity:    z.number().min(0),
  unit:        z.string().min(1).max(50).default("pcs"),
  minThreshold:z.number().min(0).default(0),
  location:    z.string().max(200).optional(),
  supplier:    z.string().max(200).optional(),
  notes:       z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const search   = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";

    const items = await prisma.adminStockItem.findMany({
      where: {
        organizationId: guard.tenantId,
        ...(search   ? { name: { contains: search, mode: "insensitive" } } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const total    = items.length;
    const lowStock = items.filter((i) => {
      const q = Number(i.quantity), m = Number(i.minThreshold);
      return q > 0 && m > 0 && q <= m;
    }).length;
    const outOfStock = items.filter((i) => Number(i.quantity) === 0).length;

    const categories = [...new Set(items.map((i) => i.category))].sort();

    return NextResponse.json({
      success: true,
      data: { items, kpis: { total, lowStock, outOfStock }, categories },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/admin/office-admin/stockroom]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const item = await prisma.adminStockItem.create({
      data: { id: createId(), organizationId: guard.tenantId, ...parsed.data },
    });
    return NextResponse.json({ success: true, data: item, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/office-admin/stockroom]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    const existing = await prisma.adminStockItem.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const parsed = schema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const updated = await prisma.adminStockItem.update({ where: { id }, data: { ...parsed.data, updatedAt: new Date() } });
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/office-admin/stockroom]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    const existing = await prisma.adminStockItem.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    await prisma.adminStockItem.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/admin/office-admin/stockroom]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
