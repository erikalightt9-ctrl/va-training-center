import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const report = searchParams.get("report") ?? "inventory-usage";
    const year   = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const month  = searchParams.get("month") ?? "";

    let dateFilter: { gte: Date; lte: Date };
    if (month) {
      const [y, m] = month.split("-").map(Number);
      dateFilter = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) };
    } else {
      dateFilter = { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) };
    }

    // ── 1. Inventory Usage Summary ───────────────────────────────────────────
    if (report === "inventory-usage") {
      const movements = await prisma.stockMovement.findMany({
        where: { organizationId: guard.tenantId, createdAt: dateFilter },
        include: { item: { select: { name: true, unit: true, category: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      });

      const byItem = movements.reduce((acc, m) => {
        const key = m.itemId;
        if (!acc[key]) acc[key] = { itemId: key, name: m.item.name, unit: m.item.unit, category: m.item.category?.name ?? "—", totalIn: 0, totalOut: 0, totalAdjust: 0 };
        if (m.type === "IN")     acc[key].totalIn     += Number(m.quantity);
        if (m.type === "OUT")    acc[key].totalOut    += Math.abs(Number(m.quantity));
        if (m.type === "ADJUST") acc[key].totalAdjust += Number(m.quantity);
        return acc;
      }, {} as Record<string, { itemId: string; name: string; unit: string; category: string; totalIn: number; totalOut: number; totalAdjust: number }>);

      return NextResponse.json({ success: true, data: Object.values(byItem), error: null });
    }

    // ── 2. Procurement Spend by Vendor ───────────────────────────────────────
    if (report === "procurement-by-vendor") {
      const items = await prisma.adminProcurementItem.findMany({
        where: { organizationId: guard.tenantId, createdAt: dateFilter, status: "DELIVERED" },
        orderBy: { createdAt: "desc" },
      });

      const byVendor = items.reduce((acc, i) => {
        const key = i.vendorName ?? "Unknown";
        if (!acc[key]) acc[key] = { vendor: key, totalItems: 0, totalQty: 0, totalSpend: 0, items: [] };
        acc[key].totalItems++;
        acc[key].totalQty   += Number(i.quantity);
        acc[key].totalSpend += Number(i.unitPrice ?? 0) * Number(i.quantity);
        acc[key].items.push({ itemName: i.itemName, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice ?? 0), poNumber: i.poNumber });
        return acc;
      }, {} as Record<string, { vendor: string; totalItems: number; totalQty: number; totalSpend: number; items: { itemName: string; quantity: number; unitPrice: number; poNumber: string | null }[] }>);

      return NextResponse.json({ success: true, data: Object.values(byVendor).sort((a, b) => b.totalSpend - a.totalSpend), error: null });
    }

    // ── 3. Fuel Cost per Vehicle ─────────────────────────────────────────────
    if (report === "fuel-per-vehicle") {
      const logs = await prisma.adminFuelLog.findMany({
        where: { organizationId: guard.tenantId, date: dateFilter },
        orderBy: { date: "desc" },
      });

      const byVehicle = logs.reduce((acc, l) => {
        const key = l.vehicleInfo;
        if (!acc[key]) acc[key] = { vehicle: key, totalLogs: 0, totalLiters: 0, totalCost: 0, avgPricePerLiter: 0, logs: [] };
        acc[key].totalLogs++;
        acc[key].totalLiters += Number(l.liters);
        acc[key].totalCost   += Number(l.totalCost ?? 0);
        acc[key].logs.push({ date: l.date, liters: Number(l.liters), totalCost: Number(l.totalCost ?? 0), driver: l.driver, station: l.station });
        return acc;
      }, {} as Record<string, { vehicle: string; totalLogs: number; totalLiters: number; totalCost: number; avgPricePerLiter: number; logs: { date: Date; liters: number; totalCost: number; driver: string | null; station: string | null }[] }>);

      // Compute avg price per liter
      Object.values(byVehicle).forEach((v) => {
        v.avgPricePerLiter = v.totalLiters > 0 ? v.totalCost / v.totalLiters : 0;
      });

      return NextResponse.json({ success: true, data: Object.values(byVehicle).sort((a, b) => b.totalCost - a.totalCost), error: null });
    }

    // ── 4. Budget vs Actual ──────────────────────────────────────────────────
    if (report === "budget-vs-actual") {
      const categories = await prisma.adminBudgetCategory.findMany({
        where: { organizationId: guard.tenantId },
        orderBy: { name: "asc" },
      });
      const entries = await prisma.adminBudgetEntry.findMany({
        where: { organizationId: guard.tenantId, entryDate: dateFilter },
      });

      const data = categories.map((cat) => {
        const catEntries = entries.filter((e) => e.categoryId === cat.id);
        const spent      = catEntries.reduce((s, e) => s + Number(e.amount), 0);
        const budget     = month ? Number(cat.monthlyBudget) : Number(cat.yearlyBudget);
        return {
          category:    cat.name,
          budget,
          spent,
          remaining:   budget - spent,
          utilization: budget > 0 ? Math.round((spent / budget) * 100) : 0,
          over:        spent > budget,
        };
      });

      return NextResponse.json({ success: true, data, error: null });
    }

    // ── 5. Monthly Expense Trends ────────────────────────────────────────────
    if (report === "monthly-trends") {
      const yearFilter = { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) };

      const [procItems, fuelLogs, budgetEntries] = await Promise.all([
        prisma.adminProcurementItem.findMany({
          where: { organizationId: guard.tenantId, status: "DELIVERED", createdAt: yearFilter },
          select: { createdAt: true, unitPrice: true, quantity: true },
        }),
        prisma.adminFuelLog.findMany({
          where: { organizationId: guard.tenantId, date: yearFilter },
          select: { date: true, totalCost: true },
        }),
        prisma.adminBudgetEntry.findMany({
          where: { organizationId: guard.tenantId, entryDate: yearFilter },
          select: { entryDate: true, amount: true },
        }),
      ]);

      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        label: new Date(year, i, 1).toLocaleString("en-PH", { month: "short" }),
        procurement: 0,
        fuel: 0,
        other: 0,
        total: 0,
      }));

      procItems.forEach((i) => {
        const m = new Date(i.createdAt).getMonth();
        months[m].procurement += Number(i.unitPrice ?? 0) * Number(i.quantity);
      });
      fuelLogs.forEach((l) => {
        const m = new Date(l.date).getMonth();
        months[m].fuel += Number(l.totalCost ?? 0);
      });
      budgetEntries.forEach((e) => {
        const m = new Date(e.entryDate).getMonth();
        months[m].other += Number(e.amount);
      });
      months.forEach((m) => { m.total = m.procurement + m.fuel + m.other; });

      return NextResponse.json({ success: true, data: months, error: null });
    }

    return NextResponse.json({ success: false, data: null, error: "Unknown report type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: String(err) }, { status: 500 });
  }
}
