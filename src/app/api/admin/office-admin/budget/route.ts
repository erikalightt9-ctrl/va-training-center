import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const categorySchema = z.object({
  name:          z.string().min(1).max(150),
  description:   z.string().optional().nullable(),
  monthlyBudget: z.number().min(0).default(0),
  yearlyBudget:  z.number().min(0).default(0),
  color:         z.string().max(20).optional().nullable(),
});

const entrySchema = z.object({
  categoryId:  z.string(),
  description: z.string().min(1).max(300),
  amount:      z.number(),
  entryDate:   z.string(),
  reference:   z.string().max(100).optional().nullable(),
  source:      z.enum(["MANUAL", "PROCUREMENT", "FUEL"]).default("MANUAL"),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource") ?? "overview";
    const month    = searchParams.get("month") ?? "";      // YYYY-MM
    const year     = searchParams.get("year")  ?? String(new Date().getFullYear());

    if (resource === "categories") {
      const cats = await prisma.adminBudgetCategory.findMany({
        where: { organizationId: guard.tenantId },
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ success: true, data: cats, error: null });
    }

    // Overview — categories with actual spend
    const categories = await prisma.adminBudgetCategory.findMany({
      where: { organizationId: guard.tenantId },
      orderBy: { name: "asc" },
    });

    let dateFilter: { gte: Date; lte: Date } | undefined;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      dateFilter = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) };
    } else {
      dateFilter = { gte: new Date(Number(year), 0, 1), lte: new Date(Number(year), 11, 31, 23, 59, 59) };
    }

    const entries = await prisma.adminBudgetEntry.findMany({
      where: { organizationId: guard.tenantId, entryDate: dateFilter },
      orderBy: { entryDate: "desc" },
    });

    // Also pull actual spend from procurement (DELIVERED items in the period)
    const procurementItems = await prisma.adminProcurementItem.findMany({
      where: {
        organizationId: guard.tenantId,
        status: "DELIVERED",
        createdAt: dateFilter,
      },
    });

    // Pull fuel costs in period
    const fuelLogs = await prisma.adminFuelLog.findMany({
      where: { organizationId: guard.tenantId, date: dateFilter },
    });

    const procSpend  = procurementItems.reduce((s, i) => s + Number(i.unitPrice ?? 0) * Number(i.quantity), 0);
    const fuelSpend  = fuelLogs.reduce((s, l) => s + Number(l.totalCost ?? 0), 0);
    const entrySpend = entries.reduce((s, e) => s + Number(e.amount), 0);

    const catMap = categories.map((cat) => {
      const catEntries = entries.filter((e) => e.categoryId === cat.id);
      const spent = catEntries.reduce((s, e) => s + Number(e.amount), 0);
      const budget = month ? Number(cat.monthlyBudget) : Number(cat.yearlyBudget);
      return {
        ...cat,
        budget,
        spent,
        remaining: budget - spent,
        utilization: budget > 0 ? Math.round((spent / budget) * 100) : 0,
        entries: catEntries,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: catMap,
        summary: {
          totalBudget:    catMap.reduce((s, c) => s + c.budget, 0),
          totalSpent:     entrySpend,
          procurementSpend: procSpend,
          fuelSpend,
          totalActual:    entrySpend + procSpend + fuelSpend,
        },
        entries,
      },
      error: null,
    });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const body = await request.json();

    if (body.resource === "category") {
      const parsed = categorySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
      const data = await prisma.adminBudgetCategory.create({
        data: { id: createId(), organizationId: guard.tenantId, ...parsed.data },
      });
      return NextResponse.json({ success: true, data, error: null }, { status: 201 });
    }

    const parsed = entrySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, data: null, error: parsed.error.message }, { status: 400 });
    const { entryDate, ...rest } = parsed.data;
    const data = await prisma.adminBudgetEntry.create({
      data: { id: createId(), organizationId: guard.tenantId, entryDate: new Date(entryDate), ...rest },
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

    const { id, resource, ...fields } = await request.json();

    if (resource === "category") {
      const existing = await prisma.adminBudgetCategory.findFirst({ where: { id, organizationId: guard.tenantId } });
      if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
      const data = await prisma.adminBudgetCategory.update({ where: { id }, data: fields });
      return NextResponse.json({ success: true, data, error: null });
    }

    const existing = await prisma.adminBudgetEntry.findFirst({ where: { id, organizationId: guard.tenantId } });
    if (!existing) return NextResponse.json({ success: false, data: null, error: "Not found" }, { status: 404 });
    const updateData = { ...fields };
    if (fields.entryDate) updateData.entryDate = new Date(fields.entryDate);
    const data = await prisma.adminBudgetEntry.update({ where: { id }, data: updateData });
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

    const { searchParams } = new URL(request.url);
    const id       = searchParams.get("id");
    const resource = searchParams.get("resource") ?? "entry";
    if (!id) return NextResponse.json({ success: false, data: null, error: "Missing id" }, { status: 400 });

    if (resource === "category") {
      await prisma.adminBudgetCategory.deleteMany({ where: { id, organizationId: guard.tenantId } });
    } else {
      await prisma.adminBudgetEntry.deleteMany({ where: { id, organizationId: guard.tenantId } });
    }
    return NextResponse.json({ success: true, data: null, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}
