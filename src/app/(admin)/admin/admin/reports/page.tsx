"use client";

import { useState, useCallback } from "react";
import {
  BarChart3,
  ShoppingCart,
  Fuel,
  DollarSign,
  TrendingUp,
  Download,
  Loader2,
  Inbox,
  Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType = "inventory" | "procurement" | "fuel" | "budget" | "expenses";
type BudgetPeriod = "monthly" | "yearly";

interface ReportData {
  headers: string[];
  rows: Record<string, unknown>[];
}

// ─── Report definitions ───────────────────────────────────────────────────────

interface ReportDef {
  type: ReportType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
}

const REPORTS: ReportDef[] = [
  {
    type: "inventory",
    label: "Inventory Usage",
    description: "Stock in/out movements per item",
    icon: Package,
    color: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    type: "procurement",
    label: "Procurement Spend",
    description: "Vendor spend on delivered POs",
    icon: ShoppingCart,
    color: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    type: "fuel",
    label: "Fuel Cost",
    description: "Per-vehicle fuel usage and cost",
    icon: Fuel,
    color: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    type: "budget",
    label: "Budget vs Actual",
    description: "Category budgets vs actual spend",
    icon: DollarSign,
    color: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    type: "expenses",
    label: "Monthly Expenses",
    description: "Procurement + fuel + other spend trend",
    icon: TrendingUp,
    color: "text-rose-600",
    iconBg: "bg-rose-50",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtCell = (v: unknown): string => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") {
    // Detect likely currency values (large or decimal) vs plain counts
    return v.toLocaleString("en-PH", { maximumFractionDigits: 2 });
  }
  return String(v);
};

// ─── Expenses Bar Chart ───────────────────────────────────────────────────────

interface ExpensesChartProps {
  rows: Record<string, unknown>[];
  headers: string[];
}

function ExpensesChart({ rows, headers }: ExpensesChartProps) {
  // Find which column looks like a total/amount (last numeric column or one named "total"/"amount")
  const valueKey =
    headers.find((h) => /total|amount|cost|spend/i.test(h)) ??
    headers.find((h) => rows.some((r) => typeof r[h] === "number")) ??
    headers[headers.length - 1];

  const labelKey = headers[0];

  const values = rows.map((r) => {
    const raw = r[valueKey];
    return typeof raw === "number" ? raw : parseFloat(String(raw)) || 0;
  });

  const max = Math.max(...values, 1);

  const BAR_COLORS = [
    "bg-rose-400",
    "bg-rose-500",
    "bg-rose-600",
    "bg-rose-400",
    "bg-rose-500",
    "bg-rose-600",
    "bg-rose-400",
    "bg-rose-500",
    "bg-rose-600",
    "bg-rose-400",
    "bg-rose-500",
    "bg-rose-600",
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {valueKey} by {labelKey}
      </p>
      <div className="space-y-2.5">
        {rows.map((row, i) => {
          const val    = values[i];
          const pct    = (val / max) * 100;
          const label  = fmtCell(row[labelKey]);

          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-28 shrink-0 truncate" title={label}>
                {label}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                >
                  {pct > 15 && (
                    <span className="text-[10px] font-bold text-white tabular-nums">
                      {val.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              </div>
              {pct <= 15 && (
                <span className="text-[10px] text-slate-500 tabular-nums w-20 text-right shrink-0">
                  {val.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeType, setActiveType]   = useState<ReportType | null>(null);
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>("monthly");
  const [data, setData]               = useState<ReportData | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [exporting, setExporting]     = useState(false);

  const load = useCallback(async (type: ReportType, period?: BudgetPeriod) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const params = new URLSearchParams({ type });
      if (type === "budget") params.set("period", period ?? budgetPeriod);
      const res  = await fetch(`/api/admin/office-admin/reports?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load report");
      // Normalise: API may return { headers, rows } directly or wrapped in data
      const payload: ReportData = json.headers ? json : (json.data ?? { headers: [], rows: [] });
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [budgetPeriod]);

  const selectReport = (type: ReportType) => {
    setActiveType(type);
    load(type);
  };

  const handleExport = async () => {
    if (!activeType) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({ type: activeType, format: "csv" });
      if (activeType === "budget") params.set("period", budgetPeriod);
      const url = `/api/admin/office-admin/reports?${params}`;
      const a   = document.createElement("a");
      a.href    = url;
      a.download = `${activeType}-report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setExporting(false);
    }
  };

  const activeDef = REPORTS.find((r) => r.type === activeType) ?? null;
  const isExpenses = activeType === "expenses";
  const hasData    = data && data.rows.length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">Usage reports, cost analysis, and audit summaries</p>
      </div>

      {/* Report selector */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex gap-3 pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:pb-0">
          {REPORTS.map((r) => {
            const Icon    = r.icon;
            const active  = activeType === r.type;
            return (
              <button
                key={r.type}
                onClick={() => selectReport(r.type)}
                className={`flex-shrink-0 w-44 sm:w-auto flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all ${
                  active
                    ? "border-slate-800 bg-slate-800 text-white shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm text-slate-700"
                }`}
              >
                <div className={`p-2 rounded-lg ${active ? "bg-white/15" : r.iconBg}`}>
                  <Icon className={`h-4 w-4 ${active ? "text-white" : r.color}`} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className={`text-xs font-semibold leading-snug ${active ? "text-white" : "text-slate-800"}`}>
                    {r.label}
                  </p>
                  <p className={`text-[11px] leading-snug ${active ? "text-white/70" : "text-slate-400"}`}>
                    {r.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report output area */}
      {activeType && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          {/* Report toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 flex-wrap">
            <div className="flex items-center gap-3">
              {activeDef && (
                <div className={`p-1.5 rounded-lg ${activeDef.iconBg}`}>
                  <activeDef.icon className={`h-4 w-4 ${activeDef.color}`} />
                </div>
              )}
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{activeDef?.label}</h2>
                <p className="text-[11px] text-slate-400">{activeDef?.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Budget period toggle */}
              {activeType === "budget" && (
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  {(["monthly", "yearly"] as BudgetPeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setBudgetPeriod(p);
                        load("budget", p);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                        budgetPeriod === p ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Export button */}
              <button
                onClick={handleExport}
                disabled={exporting || loading || !hasData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg transition-colors"
                title="Export as CSV"
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Export CSV
              </button>
            </div>
          </div>

          {/* Report body */}
          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                <p className="text-xs text-slate-400">Loading report…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-red-500">
                <BarChart3 className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">Failed to load report</p>
                <p className="text-xs text-red-400">{error}</p>
                <button
                  onClick={() => load(activeType)}
                  className="mt-2 text-xs text-slate-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : !hasData ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <Inbox className="h-10 w-10 opacity-25" />
                <p className="text-sm">No data available for this report.</p>
              </div>
            ) : isExpenses ? (
              /* ── Monthly Expenses: bar visualisation ── */
              <ExpensesChart rows={data.rows} headers={data.headers} />
            ) : (
              /* ── Standard table ── */
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {data.headers.map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2.5 font-semibold text-slate-600 bg-slate-50 first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        {data.headers.map((h) => (
                          <td
                            key={h}
                            className={`px-3 py-2.5 text-slate-700 ${
                              typeof row[h] === "number" ? "tabular-nums text-right" : ""
                            }`}
                          >
                            {fmtCell(row[h])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Row count */}
                <p className="text-[11px] text-slate-400 mt-3 text-right">
                  {data.rows.length} {data.rows.length === 1 ? "row" : "rows"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Idle state — no report selected */}
      {!activeType && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <BarChart3 className="h-12 w-12 opacity-20" />
          <p className="text-sm">Select a report type above to load data.</p>
        </div>
      )}
    </div>
  );
}
