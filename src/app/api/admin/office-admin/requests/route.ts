import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title:       z.string().min(1).max(200),
  category:    z.enum(["SUPPLIES", "REPAIR", "IT", "FACILITIES", "OTHER"]),
  description: z.string().min(1),
  priority:    z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  requestedBy: z.string().min(1).max(200),
  department:  z.string().max(150).optional().nullable(),
});

const updateSchema = z.object({
  id:             z.string(),
  action:         z.enum(["APPROVE", "REJECT", "COMPLETE"]),
  note:           z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status") ?? "";
    const category = searchParams.get("category") ?? "";
    const q        = searchParams.get("q") ?? "";

    const data = await prisma.adminOfficeRequest.findMany({
      where: {
        organizationId: guard.tenantId,
        ...(status   && { status:   status   as never }),
        ...(category && { category: category }),
        ...(q        && { OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { requestedBy: { contains: q, mode: "insensitive" } },
          { department:  { contains: q, mode: "insensitive" } },
        ]}),
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      PENDING:   data.filter((r) => r.status === "PENDING").length,
      APPROVED:  data.filter((r) => r.status === "APPROVED").length,
      COMPLETED: data.filter((r) => r.status === "COMPLETED").length,
      REJECTED:  data.filter((r) => r.status === "REJECTED").length,
    };

    return NextResponse.json({ success: true, data, counts, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const data = await prisma.adminOfficeRequest.create({
      data: { id: createId(), organizationId: guard.tenantId, ...parsed.data },
    });
    return NextResponse.json({ success: true, data, error: null }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    const existing = await prisma.adminOfficeRequest.findFirst({
      where: { id: parsed.data.id, organizationId: guard.tenantId },
    });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });

    const now     = new Date();
    const actorId = String(token?.name ?? "Admin");

    const updateData =
      parsed.data.action === "APPROVE"  ? { status: "APPROVED"  as const, approvedBy: actorId,  approvedAt:  now } :
      parsed.data.action === "REJECT"   ? { status: "REJECTED"  as const, rejectedBy: actorId,  rejectedAt:  now, rejectionNote:  parsed.data.note ?? null } :
                                          { status: "COMPLETED" as const, completedBy: actorId, completedAt: now, completionNote: parsed.data.note ?? null };

    const data = await prisma.adminOfficeRequest.update({ where: { id: parsed.data.id }, data: updateData });
    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    await prisma.adminOfficeRequest.deleteMany({ where: { id, organizationId: guard.tenantId } });
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}
