import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

function csvRow(cols: (string | number | null | undefined)[]): string {
  return cols.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",");
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;

    const { searchParams } = new URL(request.url);
    const type   = searchParams.get("type") ?? "inventory";
    const format = searchParams.get("format") ?? "json";

    let rows: Record<string, unknown>[] = [];
    let headers: string[] = [];

    if (type === "inventory") {
      const items = await prisma.inventoryItem.findMany({
        where: { organizationId: guard.tenantId },
        include: { category: { select: { name: true } }, movements: { select: { type: true, quantity: true } } },
        orderBy: { name: "asc" },
      });
      headers = ["Item Name", "Category", "Stock In", "Stock Out", "Net Movement", "Current Stock", "Unit", "Min Level"];
      rows = items.map((item) => {
        const stockIn  = item.movements.filter((m) => m.type === "IN").reduce((s, m) => s + Number(m.quantity), 0);
        const stockOut = item.movements.filter((m) => m.type === "OUT").reduce((s, m) => s + Math.abs(Number(m.quantity)), 0);
        return { "Item Name": item.name, "Category": item.category?.name ?? "—", "Stock In": stockIn, "Stock Out": stockOut, "Net Movement": stockIn - stockOut, "Current Stock": Number(item.totalStock), "Unit": item.unit, "Min Level": Number(item.minThreshold) };
      });
    }

    if (type === "procurement") {
      const items = await prisma.adminProcurementItem.findMany({
        where: { organizationId: guard.tenantId, status: "DELIVERED" },
        orderBy: { vendorName: "asc" },
      });
      const byVendor = new Map<string, number>();
      for (const item of items) {
        const vendor = item.vendorName ?? "Unknown";
        const spend  = item.unitPrice ? Number(item.unitPrice) * Number(item.quantity) : 0;
        byVendor.set(vendor, (byVendor.get(vendor) ?? 0) + spend);
      }
      headers = ["Vendor", "Total Spend (₱)", "Order Count"];
      const vendorCounts = new Map<string, number>();
      for (const item of items) {
        const v = item.vendorName ?? "Unknown";
        vendorCounts.set(v, (vendorCounts.get(v) ?? 0) + 1);
      }
      rows = [...byVendor.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([vendor, spend]) => ({ "Vendor": vendor, "Total Spend (₱)": spend.toFixed(2), "Order Count": vendorCounts.get(vendor) ?? 0 }));
    }

    if (type === "fuel") {
      const logs = await prisma.adminFuelLog.findMany({
        where: { organizationId: guard.tenantId },
        orderBy: { date: "desc" },
      });
      const byVehicle = new Map<string, { liters: number; cost: number; count: number }>();
      for (const log of logs) {
        const v = log.vehicleInfo;
        const cur = byVehicle.get(v) ?? { liters: 0, cost: 0, count: 0 };
        byVehicle.set(v, { liters: cur.liters + Number(log.liters ?? 0), cost: cur.cost + Number(log.totalCost ?? 0), count: cur.count + 1 });
      }
      headers = ["Vehicle", "Total Liters", "Total Cost (₱)", "Avg ₱/Liter", "Fill-ups"];
      rows = [...byVehicle.entries()].map(([v, d]) => ({
        "Vehicle": v, "Total Liters": d.liters.toFixed(2), "Total Cost (₱)": d.cost.toFixed(2),
        "Avg ₱/Liter": d.liters > 0 ? (d.cost / d.liters).toFixed(2) : "0.00", "Fill-ups": d.count,
      }));
    }

    if (type === "budget") {
      const period = searchParams.get("period") ?? "monthly";
      const categories = await prisma.adminBudgetCategory.findMany({
        where: { organizationId: guard.tenantId },
        include: { entries: { select: { amount: true, entryDate: true } } },
      });
      const now = new Date();
      const cutoff = period === "monthly" ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.getFullYear(), 0, 1);
      headers = ["Category", "Budget (₱)", "Actual Spend (₱)", "Remaining (₱)", "Utilization %", "Status"];
      rows = categories.map((cat) => {
        const actual = cat.entries.filter((e) => new Date(e.entryDate) >= cutoff).reduce((s, e) => s + Number(e.amount), 0);
        const budget = period === "monthly" ? Number(cat.monthlyBudget) : Number(cat.yearlyBudget);
        const remaining = budget - actual;
        return { "Category": cat.name, "Budget (₱)": budget.toFixed(2), "Actual Spend (₱)": actual.toFixed(2), "Remaining (₱)": remaining.toFixed(2), "Utilization %": budget > 0 ? Math.round((actual / budget) * 100) : 0, "Status": actual > budget ? "Over Budget" : "On Track" };
      });
    }

    if (type === "expenses") {
      const now = new Date();
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), i, 1);
        return { month: i, label: d.toLocaleString("en-PH", { month: "short" }) + " " + now.getFullYear() };
      });
      const [procItems, fuelLogs, budgetEntries] = await Promise.all([
        prisma.adminProcurementItem.findMany({ where: { organizationId: guard.tenantId, status: "DELIVERED" }, select: { unitPrice: true, quantity: true, deliveryDate: true } }),
        prisma.adminFuelLog.findMany({ where: { organizationId: guard.tenantId }, select: { totalCost: true, date: true } }),
        prisma.adminBudgetEntry.findMany({ where: { category: { organizationId: guard.tenantId } }, select: { amount: true, entryDate: true } }),
      ]);
      headers = ["Month", "Procurement (₱)", "Fuel (₱)", "Other Expenses (₱)", "Total (₱)"];
      rows = months.map(({ month, label }) => {
        const proc  = procItems.filter((p) => p.deliveryDate && new Date(p.deliveryDate).getMonth() === month && new Date(p.deliveryDate).getFullYear() === now.getFullYear()).reduce((s, p) => s + (p.unitPrice ? Number(p.unitPrice) * Number(p.quantity) : 0), 0);
        const fuel  = fuelLogs.filter((f) => new Date(f.date).getMonth() === month && new Date(f.date).getFullYear() === now.getFullYear()).reduce((s, f) => s + Number(f.totalCost ?? 0), 0);
        const other = budgetEntries.filter((e) => new Date(e.entryDate).getMonth() === month && new Date(e.entryDate).getFullYear() === now.getFullYear()).reduce((s, e) => s + Number(e.amount), 0);
        return { "Month": label, "Procurement (₱)": proc.toFixed(2), "Fuel (₱)": fuel.toFixed(2), "Other Expenses (₱)": other.toFixed(2), "Total (₱)": (proc + fuel + other).toFixed(2) };
      });
    }

    if (format === "csv") {
      const csv = [headers.join(","), ...rows.map((r) => csvRow(headers.map((h) => r[h] as string | number | null | undefined)))].join("\n");
      return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${type}-report.csv"` } });
    }

    return NextResponse.json({ success: true, data: { headers, rows }, error: null });
  } catch (err) {
    return NextResponse.json({ success: false, data: null, error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
