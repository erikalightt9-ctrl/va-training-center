import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name:        z.string().min(1).max(200),
  category:    z.string().max(100).optional(),
  quantity:    z.number().min(0),
  unit:        z.string().min(1).max(50).default("pcs"),
  reorderLevel:z.number().min(0).default(0),
  expiryDate:  z.string().optional().nullable(),
  batchNumber: z.string().max(100).optional().nullable(),
  supplier:    z.string().max(200).optional().nullable(),
  notes:       z.string().optional().nullable(),
});

function encodeNotes(data: z.infer<typeof schema>): string {
  const meta = JSON.stringify({
    expiryDate:  data.expiryDate  ?? null,
    batchNumber: data.batchNumber ?? null,
    notes:       data.notes       ?? null,
  });
  return `__medicine__${meta}`;
}

function decodeItem(item: { id: string; organizationId: string; name: string; category?: string | null; quantity: number | string | { toNumber: () => number }; unit: string; reorderLevel: number | string | { toNumber: () => number }; supplier?: string | null; notes?: string | null; createdAt: Date; updatedAt: Date }) {
  let expiryDate = null, batchNumber = null, notes = null;
  if (item.notes?.startsWith("__medicine__")) {
    try {
      const parsed = JSON.parse(item.notes.slice("__medicine__".length));
      expiryDate  = parsed.expiryDate  ?? null;
      batchNumber = parsed.batchNumber ?? null;
      notes       = parsed.notes       ?? null;
    } catch {
      notes = item.notes.slice("__medicine__".length).trim() || null;
    }
  }
  return { ...item, expiryDate, batchNumber, notes };
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";

    const items = await prisma.adminPantryItem.findMany({
      where: {
        organizationId: guard.tenantId,
        notes: { startsWith: "__medicine__" },
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
    });

    const decoded    = items.map(decodeItem);
    const total      = decoded.length;
    const lowStock   = decoded.filter((i) => { const q = Number(i.quantity), r = Number(i.reorderLevel); return q > 0 && r > 0 && q <= r; }).length;
    const outOfStock = decoded.filter((i) => Number(i.quantity) === 0).length;

    const today = new Date().toISOString().slice(0, 10);
    const expiryWarning = decoded.filter((i) => i.expiryDate && i.expiryDate <= today).length;

    return NextResponse.json({
      success: true,
      data: { items: decoded, kpis: { total, lowStock, outOfStock, expiryWarning } },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/admin/office-admin/medical-supplies]", err);
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

    const { expiryDate, batchNumber, notes, ...rest } = parsed.data;
    const item = await prisma.adminPantryItem.create({
      data: { id: createId(), organizationId: guard.tenantId, ...rest, notes: encodeNotes(parsed.data) },
    });

    return NextResponse.json({ success: true, data: decodeItem(item), error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/office-admin/medical-supplies]", err);
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

    const existing = await prisma.adminPantryItem.findFirst({
      where: { id, organizationId: guard.tenantId, notes: { startsWith: "__medicine__" } },
    });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const { expiryDate, batchNumber, notes, ...rest } = parsed.data;
    const updated = await prisma.adminPantryItem.update({
      where: { id },
      data: { ...rest, notes: encodeNotes(parsed.data), updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: decodeItem(updated), error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/office-admin/medical-supplies]", err);
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

    const existing = await prisma.adminPantryItem.findFirst({
      where: { id, organizationId: guard.tenantId, notes: { startsWith: "__medicine__" } },
    });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    await prisma.adminPantryItem.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/admin/office-admin/medical-supplies]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
