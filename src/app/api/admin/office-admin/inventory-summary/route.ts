import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;
    const { tenantId } = guard;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      officeItems,
      maintItems,
      medItems,
      stockItems,
      fuelLogs,
    ] = await Promise.all([
      // Office Supplies — uses InventoryItem filtered by category name
      prisma.inventoryItem.findMany({
        where: { organizationId: tenantId },
        select: { totalStock: true, minThreshold: true },
      }),
      // Maintenance Supplies
      prisma.adminMaintenanceItem.findMany({
        where: { organizationId: tenantId },
        select: { quantity: true, reorderLevel: true },
      }),
      // Medical Supplies — AdminPantryItem with __medicine__ prefix
      prisma.adminPantryItem.findMany({
        where: { organizationId: tenantId, notes: { startsWith: "__medicine__" } },
        select: { quantity: true, reorderLevel: true },
      }),
      // Stockroom
      prisma.adminStockItem.findMany({
        where: { organizationId: tenantId },
        select: { quantity: true, minThreshold: true },
      }),
      // Fuel logs this month
      prisma.adminFuelLog.findMany({
        where: { organizationId: tenantId, date: { gte: monthStart } },
        select: { vehicleInfo: true },
      }),
    ]);

    function calcStat(items: { quantity?: number | string | { toNumber?: () => number }; totalStock?: number | string | { toNumber?: () => number }; reorderLevel?: number | string | { toNumber?: () => number }; minThreshold?: number | string | { toNumber?: () => number } }[]) {
      let low = 0, out = 0;
      for (const it of items) {
        const qty = Number((it.quantity ?? it.totalStock) ?? 0);
        const min = Number((it.reorderLevel ?? it.minThreshold) ?? 0);
        if (qty === 0) out++;
        else if (min > 0 && qty <= min) low++;
      }
      return { total: items.length, lowStock: low, outOfStock: out };
    }

    const allVehicles = new Set(fuelLogs.map((f) => f.vehicleInfo));

    return NextResponse.json({
      success: true,
      data: {
        officeSupplies:      calcStat(officeItems),
        maintenanceSupplies: calcStat(maintItems),
        medicalSupplies:     calcStat(medItems),
        stockroom:           calcStat(stockItems),
        fuelMaintenance: {
          totalVehicles:  allVehicles.size,
          logsThisMonth:  fuelLogs.length,
        },
      },
      error: null,
    });
  } catch (err) {
    console.error("[GET /api/admin/office-admin/inventory-summary]", err);
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}
