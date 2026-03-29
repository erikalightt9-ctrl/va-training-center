import { Building2, DollarSign, TrendingUp, Users } from "lucide-react";
import {
  getPlatformAnalytics,
  getRevenueAnalytics,
  getAllTenantsWithStats,
} from "@/lib/repositories/superadmin.repository";

function formatMoney(cents: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(iso: string | Date | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PLAN_BADGE: Record<string, string> = {
  TRIAL:        "bg-amber-50 text-amber-700 border border-amber-200",
  STARTER:      "bg-blue-50 text-blue-700 border border-blue-200",
  PROFESSIONAL: "bg-blue-50 text-blue-700 border border-blue-200",
  ENTERPRISE:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const PLAN_BAR_COLOR: Record<string, string> = {
  TRIAL:        "bg-amber-400",
  STARTER:      "bg-blue-400",
  PROFESSIONAL: "bg-blue-500",
  ENTERPRISE:   "bg-emerald-500",
};

export default async function SuperAdminOverviewPage() {
  const [analytics, revenue, tenants] = await Promise.all([
    getPlatformAnalytics().catch(() => null),
    getRevenueAnalytics().catch(() => null),
    getAllTenantsWithStats().catch(() => [] as Awaited<ReturnType<typeof getAllTenantsWithStats>>),
  ]);

  const totalPlanCount = revenue?.planDistribution.reduce((s, p) => s + p.count, 0) ?? 0;

  const kpis = [
    {
      label: "Total Tenants",
      value: analytics?.tenantCount ?? "—",
      subtitle: `${analytics?.activeTenants ?? 0} active`,
      icon: Building2,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Active Tenants",
      value: analytics?.activeTenants ?? "—",
      subtitle: `${analytics?.trialTenants ?? 0} on trial`,
      icon: Users,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "MRR",
      value: revenue ? formatMoney(revenue.mrrCents) : "—",
      subtitle: "Monthly recurring revenue",
      icon: TrendingUp,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: revenue ? formatMoney(revenue.totalRevenueCents) : "—",
      subtitle: "All-time paid subscriptions",
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          System-wide metrics across all tenants.
        </p>
      </div>

      {/* Row 1 — KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, subtitle, icon: Icon, iconColor, iconBg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
              <span className={`p-2 rounded-lg ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — Tenant Health Table + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Health Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Tenant Health</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                  Tenant
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                  Plan
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                  Students
                </th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.slice(0, 8).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 truncate max-w-[120px]">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.subdomain ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_BADGE[t.plan] ?? "bg-slate-50 text-slate-500"}`}
                    >
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          t.plan === "TRIAL"
                            ? "bg-amber-400"
                            : t.isActive
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs text-slate-600">
                        {t.plan === "TRIAL" ? "Trial" : t.isActive ? "Active" : "Suspended"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">
                    {t._count.students}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-500">
                    {formatDate(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenants.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">No tenants yet.</div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Plan Distribution</h2>
          <div className="space-y-4">
            {revenue?.planDistribution.length ? (
              revenue.planDistribution.map(({ plan, count }) => {
                const pct = totalPlanCount > 0 ? Math.round((count / totalPlanCount) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          PLAN_BADGE[plan] ?? "bg-slate-50 text-slate-500"
                        }`}
                      >
                        {plan}
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {count} tenant{count !== 1 ? "s" : ""} &middot; {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          PLAN_BAR_COLOR[plan] ?? "bg-slate-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No plan data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 3 — Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Recent Payments</h2>
          <p className="text-xs text-slate-400 mt-0.5">Last 5 subscription payments across all tenants</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                Plan
              </th>
              <th className="text-left px-5 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                Date
              </th>
              <th className="text-right px-5 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {revenue?.recentPayments.slice(0, 5).map((p, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      PLAN_BADGE[p.plan] ?? "bg-slate-50 text-slate-500"
                    }`}
                  >
                    {p.plan}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500 text-xs">
                  {formatDate(p.paidAt)}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-slate-900">
                  {formatMoney(p.amountCents, p.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!revenue?.recentPayments.length && (
          <div className="py-8 text-center text-sm text-slate-400">No payments recorded yet.</div>
        )}
      </div>
    </div>
  );
}
