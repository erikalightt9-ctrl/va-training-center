import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name:         z.string().min(1).max(200),
  category:     z.string().max(100).optional(),
  quantity:     z.number().min(0),
  unit:         z.string().min(1).max(50).default("pcs"),
  reorderLevel: z.number().min(0).default(0),
  supplier:     z.string().max(200).optional(),
  notes:        z.string().optional(),
});

// Medicine items share the adminPantryItem table but are distinguished by
// a "__medicine__" prefix stored in the notes field.

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const data = await prisma.adminPantryItem.findMany({
      where: {
        organizationId: guard.tenantId,
        notes: { startsWith: "__medicine__" },
      },
      orderBy: { name: "asc" },
    });

    const cleaned = data.map((item) => ({
      ...item,
      notes: item.notes?.replace(/^__medicine__/, "").trim() || null,
    }));

    return NextResponse.json({ success: true, data: cleaned, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const { notes, ...rest } = parsed.data;
    const record = await prisma.adminPantryItem.create({
      data: {
        id: createId(),
        organizationId: guard.tenantId,
        ...rest,
        notes: `__medicine__${notes ?? ""}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...record, notes: record.notes?.replace(/^__medicine__/, "").trim() || null },
      error: null,
    }, { status: 201 });
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

    const existing = await prisma.adminPantryItem.findFirst({
      where: { id, organizationId: guard.tenantId, notes: { startsWith: "__medicine__" } },
    });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const { notes, ...rest } = parsed.data;
    const updated = await prisma.adminPantryItem.update({
      where: { id },
      data: { ...rest, notes: `__medicine__${notes ?? ""}`, updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: { ...updated, notes: updated.notes?.replace(/^__medicine__/, "").trim() || null },
      error: null,
    });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
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
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
