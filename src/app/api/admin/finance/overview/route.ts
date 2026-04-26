import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const TTL = 3 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const guard = requireAdmin(token);
    if (!guard.ok) return guard.response;
    const tenantId = guard.tenantId;

    const hit = cache.get(tenantId);
    if (hit && hit.expiresAt > Date.now()) {
      return NextResponse.json({ success: true, data: hit.data, error: null });
    }

    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = monthStart;

    const [
      bankAccounts,
      invoicesByStatus,
      expensesThisMonth,
      expensesLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      lastPayrollRun,
      recentInvoices,
      recentExpenses,
    ] = await Promise.all([
      prisma.accBankAccount.findMany({
        where: { organizationId: tenantId },
        select: { id: true, name: true, bankName: true, currentBalance: true, currency: true, lastReconciledAt: true },
        orderBy: { currentBalance: "desc" },
      }),
      prisma.accInvoice.groupBy({
        by: ["status"],
        where: { organizationId: tenantId },
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
      prisma.accExpense.aggregate({
        where: {
          organizationId: tenantId,
          status: { in: ["APPROVED", "PAID"] },
          expenseDate: { gte: monthStart, lt: monthEnd },
        },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
      prisma.accExpense.aggregate({
        where: {
          organizationId: tenantId,
          status: { in: ["APPROVED", "PAID"] },
          expenseDate: { gte: lastMonthStart, lt: lastMonthEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.accInvoice.aggregate({
        where: {
          organizationId: tenantId,
          status: "PAID",
          paidAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
      prisma.accInvoice.aggregate({
        where: {
          organizationId: tenantId,
          status: "PAID",
          paidAt: { gte: lastMonthStart, lt: lastMonthEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.hrPayrollRun.findFirst({
        where: { organizationId: tenantId },
        orderBy: { periodStart: "desc" },
        select: { runNumber: true, status: true, periodStart: true, periodEnd: true, totalGross: true, totalNet: true, _count: { select: { lines: true } } },
      }),
      prisma.accInvoice.findMany({
        where: { organizationId: tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, invoiceNumber: true, customerName: true, totalAmount: true, paidAmount: true, status: true, dueDate: true, issueDate: true },
      }),
      prisma.accExpense.findMany({
        where: { organizationId: tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, expenseNumber: true, vendor: true, category: true, totalAmount: true, status: true, expenseDate: true },
      }),
    ]);

    const totalBankBalance = bankAccounts.reduce((s, b) => s + Number(b.currentBalance), 0);

    const invByStatus: Record<string, { count: number; total: number }> = {};
    for (const row of invoicesByStatus) {
      invByStatus[row.status] = { count: row._count._all, total: Number(row._sum.totalAmount ?? 0) };
    }
    const openStatuses = ["DRAFT", "SENT", "PARTIALLY_PAID", "OVERDUE"];
    const totalReceivables = openStatuses.reduce((s, st) => s + (invByStatus[st]?.total ?? 0), 0);
    const overdueCount     = invByStatus["OVERDUE"]?.count ?? 0;

    const expMtd      = Number(expensesThisMonth._sum.totalAmount ?? 0);
    const expLastMtd  = Number(expensesLastMonth._sum.totalAmount ?? 0);
    const revMtd      = Number(revenueThisMonth._sum.totalAmount ?? 0);
    const revLastMtd  = Number(revenueLastMonth._sum.totalAmount ?? 0);
    const netMtd      = revMtd - expMtd;

    const data = {
      summary: {
        totalBankBalance,
        totalReceivables,
        overdueCount,
        expensesThisMonth: expMtd,
        expensesLastMonth: expLastMtd,
        revenueThisMonth:  revMtd,
        revenueLastMonth:  revLastMtd,
        netThisMonth:      netMtd,
        payrollCost:       lastPayrollRun ? Number(lastPayrollRun.totalNet) : 0,
      },
      bankAccounts: bankAccounts.map((b) => ({
        ...b,
        currentBalance: Number(b.currentBalance),
      })),
      invoicesByStatus: Object.entries(invByStatus).map(([status, v]) => ({ status, ...v })),
      recentInvoices: recentInvoices.map((i) => ({
        ...i,
        totalAmount: Number(i.totalAmount),
        paidAmount:  Number(i.paidAmount),
      })),
      recentExpenses: recentExpenses.map((e) => ({
        ...e,
        totalAmount: Number(e.totalAmount),
      })),
      lastPayrollRun: lastPayrollRun
        ? {
            ...lastPayrollRun,
            totalGross: Number(lastPayrollRun.totalGross),
            totalNet:   Number(lastPayrollRun.totalNet),
            employeeCount: lastPayrollRun._count.lines,
          }
        : null,
    };

    cache.set(tenantId, { data, expiresAt: Date.now() + TTL });
    return NextResponse.json({ success: true, data, error: null });
  } catch (err) {
    console.error("[GET /api/admin/finance/overview]", err);
    return NextResponse.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
