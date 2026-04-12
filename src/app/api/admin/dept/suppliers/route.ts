import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name:          z.string().min(1).max(200),
  contactPerson: z.string().max(150).optional(),
  email:         z.string().email().optional(),
  phone:         z.string().max(50).optional(),
  address:       z.string().optional(),
  category:      z.string().max(100).optional(),
  status:        z.enum(["ACTIVE","INACTIVE"]).default("ACTIVE"),
  notes:         z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);

    if (searchParams.get("stats") === "1") {
      const active = await prisma.adminSupplier.count({ where: { organizationId: guard.tenantId, status: "ACTIVE" } });
      return NextResponse.json({ success: true, data: { active }, error: null });
    }

    const status = searchParams.get("status") ?? undefined;
    const data = await prisma.adminSupplier.findMany({
      where: { organizationId: guard.tenantId, ...(status && { status: status as never }) },
      orderBy: { name: "asc" },
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

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const record = await prisma.adminSupplier.create({
      data: { id: createId(), organizationId: guard.tenantId, ...parsed.data },
    });
    return NextResponse.json({ success: true, data: record, error: null }, { status: 201 });
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

    const existing = await prisma.adminSupplier.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const updated = await prisma.adminSupplier.update({ where: { id }, data: { ...parsed.data, updatedAt: new Date() } });
    return NextResponse.json({ success: true, data: updated, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
