"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, Download, Loader2, RefreshCw, TrendingUp, Package, Truck, DollarSign, Calendar } from "lucide-react";

type ReportType = "inventory-usage" | "procurement-by-vendor" | "fuel-per-vehicle" | "budget-vs-actual" | "monthly-trends";

const REPORT_TABS: { key: ReportType; label: string; icon: React.ReactNode }[] = [
  { key: "inventory-usage",      label: "Inventory Usage",      icon: <Package    className="h-3.5 w-3.5" /> },
  { key: "procurement-by-vendor",label: "Procurement by Vendor",icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { key: "fuel-per-vehicle",     label: "Fuel per Vehicle",     icon: <Truck      className="h-3.5 w-3.5" /> },
  { key: "budget-vs-actual",     label: "Budget vs Actual",     icon: <DollarSign className="h-3.5 w-3.5" /> },
  { key: "monthly-trends",       label: "Monthly Trends",       icon: <Calendar   className="h-3.5 w-3.5" /> },
];

const fmt   = (n: number) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const thCls = "px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap";
const tdCls = "px-4 py-3 text-sm";

// ── Export to CSV ─────────────────────────────────────────────────────────────
function exportCSV(data: Record<string,unknown>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(","), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("inventory-usage");
  const [data, setData]     = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [month, setMonth]   = useState(() => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; });
  const [year, setYear]     = useState(String(new Date().getFullYear()));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ report: activeReport });
      if (period === "month") p.set("month", month); else p.set("year", year);
      const res  = await fetch(`/api/admin/office-admin/reports?${p}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally { setLoading(false); }
  }, [activeReport, period, month, year]);

  useEffect(() => { void load(); }, [load]);

  // ── Bar chart (simple SVG) ────────────────────────────────────────────────
  function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <span className="text-xs tabular-nums text-slate-500 w-8 text-right">{Math.round(pct)}%</span>
      </div>
    );
  }

  // ── Render per report type ────────────────────────────────────────────────
  function renderTable() {
    if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
    if (!data.length) return <div className="py-16 text-center text-sm text-slate-400">No data for the selected period.</div>;

    if (activeReport === "inventory-usage") {
      const rows = data as { itemId:string; name:string; unit:string; category:string; totalIn:number; totalOut:number; totalAdjust:number }[];
      const maxOut = Math.max(...rows.map((r)=>r.totalOut), 1);
      return (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{["Item","Category","Unit","Stock In","Stock Out","Usage Bar","Adjustments"].map((h)=><th key={h} className={thCls}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r)=>(
              <tr key={r.itemId} className="hover:bg-slate-50">
                <td className={`${tdCls} font-medium text-slate-800`}>{r.name}</td>
                <td className={`${tdCls} text-slate-500 text-xs`}>{r.category}</td>
                <td className={`${tdCls} text-slate-500`}>{r.unit}</td>
                <td className={`${tdCls} text-emerald-700 font-semibold tabular-nums`}>+{r.totalIn}</td>
                <td className={`${tdCls} text-red-600 font-semibold tabular-nums`}>{r.totalOut}</td>
                <td className={`${tdCls} w-40`}><MiniBar value={r.totalOut} max={maxOut} color="#ef4444" /></td>
                <td className={`${tdCls} text-slate-500 tabular-nums`}>{r.totalAdjust > 0 ? `+${r.totalAdjust}` : r.totalAdjust}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeReport === "procurement-by-vendor") {
      const rows = data as { vendor:string; totalItems:number; totalQty:number; totalSpend:number }[];
      const maxSpend = Math.max(...rows.map((r)=>r.totalSpend), 1);
      return (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{["Vendor","Items Delivered","Total Qty","Total Spend","Spend Bar"].map((h)=><th key={h} className={thCls}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r,i)=>(
              <tr key={i} className="hover:bg-slate-50">
                <td className={`${tdCls} font-medium text-slate-800`}>{r.vendor}</td>
                <td className={`${tdCls} text-slate-500 tabular-nums`}>{r.totalItems}</td>
                <td className={`${tdCls} text-slate-500 tabular-nums`}>{r.totalQty.toFixed(2)}</td>
                <td className={`${tdCls} font-semibold text-slate-800 tabular-nums`}>{fmt(r.totalSpend)}</td>
                <td className={`${tdCls} w-48`}><MiniBar value={r.totalSpend} max={maxSpend} color="#6366f1" /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className={`${tdCls} font-semibold`}>{rows.length} vendors</td>
              <td className={`${tdCls} font-semibold tabular-nums`}>{rows.reduce((s,r)=>s+r.totalItems,0)}</td>
              <td />
              <td className={`${tdCls} font-semibold text-slate-800 tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.totalSpend,0))}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      );
    }

    if (activeReport === "fuel-per-vehicle") {
      const rows = data as { vehicle:string; totalLogs:number; totalLiters:number; totalCost:number; avgPricePerLiter:number }[];
      const maxCost = Math.max(...rows.map((r)=>r.totalCost), 1);
      return (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{["Vehicle","Fuel Logs","Total Liters","Avg ₱/Liter","Total Cost","Cost Bar"].map((h)=><th key={h} className={thCls}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r,i)=>(
              <tr key={i} className="hover:bg-slate-50">
                <td className={`${tdCls} font-medium text-slate-800`}>{r.vehicle}</td>
                <td className={`${tdCls} text-slate-500 tabular-nums`}>{r.totalLogs}</td>
                <td className={`${tdCls} text-blue-700 font-semibold tabular-nums`}>{r.totalLiters.toFixed(2)}L</td>
                <td className={`${tdCls} text-slate-500 tabular-nums`}>{fmt(r.avgPricePerLiter)}</td>
                <td className={`${tdCls} font-semibold text-emerald-700 tabular-nums`}>{fmt(r.totalCost)}</td>
                <td className={`${tdCls} w-48`}><MiniBar value={r.totalCost} max={maxCost} color="#10b981" /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className={`${tdCls} font-semibold`}>{rows.length} vehicles</td>
              <td className={`${tdCls} font-semibold tabular-nums`}>{rows.reduce((s,r)=>s+r.totalLogs,0)}</td>
              <td className={`${tdCls} font-semibold text-blue-700 tabular-nums`}>{rows.reduce((s,r)=>s+r.totalLiters,0).toFixed(2)}L</td>
              <td />
              <td className={`${tdCls} font-semibold text-emerald-700 tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.totalCost,0))}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      );
    }

    if (activeReport === "budget-vs-actual") {
      const rows = data as { category:string; budget:number; spent:number; remaining:number; utilization:number; over:boolean }[];
      return (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{["Category","Budget","Spent","Remaining","Utilization","Status"].map((h)=><th key={h} className={thCls}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r,i)=>(
              <tr key={i} className="hover:bg-slate-50">
                <td className={`${tdCls} font-medium text-slate-800`}>{r.category}</td>
                <td className={`${tdCls} text-slate-600 tabular-nums`}>{fmt(r.budget)}</td>
                <td className={`${tdCls} font-semibold tabular-nums ${r.over?"text-red-600":"text-slate-800"}`}>{fmt(r.spent)}</td>
                <td className={`${tdCls} tabular-nums ${r.remaining<0?"text-red-600 font-semibold":"text-slate-600"}`}>{fmt(r.remaining)}</td>
                <td className={tdCls}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.utilization>=100?"bg-red-500":r.utilization>=80?"bg-amber-500":"bg-emerald-500"}`} style={{width:`${Math.min(r.utilization,100)}%`}} />
                    </div>
                    <span className="text-xs tabular-nums w-10 text-right">{r.utilization}%</span>
                  </div>
                </td>
                <td className={tdCls}>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.over?"bg-red-100 text-red-700":r.utilization>=80?"bg-amber-100 text-amber-700":"bg-green-100 text-green-700"}`}>
                    {r.over ? "Over Budget" : r.utilization >= 80 ? "Near Limit" : "On Track"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className={`${tdCls} font-semibold`}>Total</td>
              <td className={`${tdCls} font-semibold tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.budget,0))}</td>
              <td className={`${tdCls} font-semibold tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.spent,0))}</td>
              <td className={`${tdCls} font-semibold tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.remaining,0))}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      );
    }

    if (activeReport === "monthly-trends") {
      const rows = data as { month:number; label:string; procurement:number; fuel:number; other:number; total:number }[];
      const maxTotal = Math.max(...rows.map((r)=>r.total), 1);
      return (
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{["Month","Procurement","Fuel","Other","Total","Trend"].map((h)=><th key={h} className={thCls}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r)=>(
              <tr key={r.month} className="hover:bg-slate-50">
                <td className={`${tdCls} font-medium text-slate-800`}>{r.label}</td>
                <td className={`${tdCls} text-indigo-700 tabular-nums`}>{fmt(r.procurement)}</td>
                <td className={`${tdCls} text-emerald-700 tabular-nums`}>{fmt(r.fuel)}</td>
                <td className={`${tdCls} text-slate-600 tabular-nums`}>{fmt(r.other)}</td>
                <td className={`${tdCls} font-semibold text-slate-800 tabular-nums`}>{fmt(r.total)}</td>
                <td className={`${tdCls} w-48`}><MiniBar value={r.total} max={maxTotal} color="#6366f1" /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className={`${tdCls} font-semibold`}>YTD Total</td>
              <td className={`${tdCls} font-semibold text-indigo-700 tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.procurement,0))}</td>
              <td className={`${tdCls} font-semibold text-emerald-700 tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.fuel,0))}</td>
              <td className={`${tdCls} font-semibold tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.other,0))}</td>
              <td className={`${tdCls} font-semibold tabular-nums`}>{fmt(rows.reduce((s,r)=>s+r.total,0))}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      );
    }
    return null;
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-600 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Reports</h1>
            <p className="text-xs text-slate-400">Usage reports, cost analysis, and audit summaries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(data, `${activeReport}-${month||year}.csv`)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-0.5 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
        {REPORT_TABS.map((t)=>(
          <button key={t.key} onClick={()=>setActiveReport(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeReport===t.key?"bg-slate-800 text-white shadow-sm":"text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Period selector (hide for monthly-trends which always shows full year) */}
      {activeReport !== "monthly-trends" && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            {[["month","Monthly"],["year","Yearly"]].map(([v,l])=>(
              <button key={v} onClick={()=>setPeriod(v)} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${period===v?"bg-slate-700 text-white":"text-slate-500 hover:text-slate-700"}`}>{l}</button>
            ))}
          </div>
          {period==="month" ? (
            <input type="month" value={month} onChange={(e)=>setMonth(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500" />
          ) : (
            <select value={year} onChange={(e)=>setYear(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500">
              {Array.from({length:5},(_,i)=>String(new Date().getFullYear()-i)).map((y)=><option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>
      )}
      {activeReport === "monthly-trends" && (
        <div className="flex items-center gap-3">
          <select value={year} onChange={(e)=>setYear(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500">
            {Array.from({length:5},(_,i)=>String(new Date().getFullYear()-i)).map((y)=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {renderTable()}
        </div>
      </div>
    </div>
  );
}
