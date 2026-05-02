import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const categorySchema = z.object({
  name:          z.string().min(1).max(200),
  monthlyBudget: z.number().min(0).default(0),
  yearlyBudget:  z.number().min(0).default(0),
  color:         z.string().max(20).default("#6366f1"),
});

const entrySchema = z.object({
  categoryId:  z.string(),
  description: z.string().min(1).max(300),
  amount:      z.number().min(0),
  entryDate:   z.string(),
  reference:   z.string().max(100).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const tab    = searchParams.get("tab") ?? "categories";
    const period = searchParams.get("period") ?? "monthly";

    if (tab === "entries") {
      const categoryId = searchParams.get("categoryId") ?? undefined;
      const data = await prisma.adminBudgetEntry.findMany({
        where: { category: { organizationId: guard.tenantId }, ...(categoryId && { categoryId }) },
        include: { category: { select: { id: true, name: true, color: true } } },
        orderBy: { entryDate: "desc" },
        take: 200,
      });
      return NextResponse.json({ success: true, data, error: null });
    }

    // Return categories with actual spend aggregated
    const categories = await prisma.adminBudgetCategory.findMany({
      where: { organizationId: guard.tenantId },
      include: { entries: { select: { amount: true, entryDate: true } } },
      orderBy: { name: "asc" },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear  = new Date(now.getFullYear(), 0, 1);

    const enriched = categories.map((cat) => {
      const cutoff = period === "monthly" ? startOfMonth : startOfYear;
      const actual = cat.entries
        .filter((e) => new Date(e.entryDate) >= cutoff)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const budget = period === "monthly" ? Number(cat.monthlyBudget) : Number(cat.yearlyBudget);
      return {
        id:            cat.id,
        name:          cat.name,
        color:         cat.color,
        monthlyBudget: Number(cat.monthlyBudget),
        yearlyBudget:  Number(cat.yearlyBudget),
        actualSpend:   actual,
        budget,
        utilization:   budget > 0 ? Math.round((actual / budget) * 100) : 0,
        overBudget:    budget > 0 && actual > budget,
      };
    });

    return NextResponse.json({ success: true, data: enriched, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const tab  = new URL(request.url).searchParams.get("tab") ?? "categories";
    const body = await request.json();

    if (tab === "entries") {
      const parsed = entrySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
      // Verify category belongs to tenant
      const cat = await prisma.adminBudgetCategory.findFirst({ where: { id: parsed.data.categoryId, organizationId: guard.tenantId } });
      if (!cat) return NextResponse.json({ success: false, data: null, error: "Category not found" }, { status: 404 });
      const record = await prisma.adminBudgetEntry.create({
        data: { id: createId(), ...parsed.data, entryDate: new Date(parsed.data.entryDate) },
        include: { category: { select: { id: true, name: true, color: true } } },
      });
      return NextResponse.json({ success: true, data: record, error: null }, { status: 201 });
    }

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    const record = await prisma.adminBudgetCategory.create({ data: { id: createId(), organizationId: guard.tenantId, ...parsed.data } });
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

    const { searchParams } = new URL(request.url);
    const id  = searchParams.get("id");
    const tab = searchParams.get("tab") ?? "categories";
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    const parsed = categorySchema.partial().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });

    if (tab === "categories") {
      const existing = await prisma.adminBudgetCategory.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      const updated = await prisma.adminBudgetCategory.update({ where: { id }, data: { ...parsed.data, updatedAt: new Date() } });
      return NextResponse.json({ success: true, data: updated, error: null });
    }

    return NextResponse.json({ success: false, data: null, error: "Unknown tab" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const id  = searchParams.get("id");
    const tab = searchParams.get("tab") ?? "categories";
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    if (tab === "entries") {
      await prisma.adminBudgetEntry.deleteMany({ where: { id, category: { organizationId: guard.tenantId } } });
    } else {
      await prisma.adminBudgetCategory.deleteMany({ where: { id, organizationId: guard.tenantId } });
    }
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
