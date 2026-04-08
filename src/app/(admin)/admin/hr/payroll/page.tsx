"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Plus, CheckCircle, Clock, DollarSign } from "lucide-react";

interface PayrollRun {
  id: string;
  runNumber: string;
  periodStart: string;
  periodEnd: string;
  payDate: string | null;
  status: "DRAFT" | "APPROVED" | "PAID" | "VOIDED";
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  _count: { lines: number };
}

const fmt = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const STATUS_STYLES: Record<string, string> = {
  DRAFT:    "bg-slate-100 text-slate-600",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID:     "bg-green-100 text-green-700",
  VOIDED:   "bg-red-100 text-red-600",
};

export default function PayrollPage() {
  const [runs, setRuns]         = useState<PayrollRun[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res  = await fetch(`/api/admin/hr/payroll?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRuns(json.data.data);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setActioning(id);
    try {
      const res  = await fetch(`/api/admin/hr/payroll/${id}/approve`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setActioning(null);
    }
  };

  const markPaid = async (id: string) => {
    const payDate = prompt("Enter pay date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (!payDate) return;
    setActioning(id);
    try {
      const res  = await fetch(`/api/admin/hr/payroll/${id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payDate }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payroll Runs</h1>
          <p className="text-sm text-slate-500 mt-1">{total} total payroll runs</p>
        </div>
        <Link
          href="/admin/hr/payroll/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New Payroll Run
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {runs.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
              <DollarSign className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No payroll runs yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first payroll run to get started.</p>
            </div>
          ) : (
            runs.map((run) => (
              <div key={run.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-semibold text-slate-800">{run.runNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[run.status]}`}>
                        {run.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Period: {new Date(run.periodStart).toLocaleDateString("en-PH")} — {new Date(run.periodEnd).toLocaleDateString("en-PH")}
                      {run.payDate && ` · Pay Date: ${new Date(run.payDate).toLocaleDateString("en-PH")}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{run._count.lines} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total Net Pay</p>
                    <p className="text-lg font-bold text-indigo-700">{fmt(Number(run.totalNet))}</p>
                    <p className="text-xs text-slate-400">
                      Gross: {fmt(Number(run.totalGross))} · Deductions: {fmt(Number(run.totalDeductions))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                  <Link href={`/admin/hr/payroll/${run.id}`} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    View Payslips
                  </Link>
                  {run.status === "DRAFT" && (
                    <button
                      onClick={() => approve(run.id)}
                      disabled={actioning === run.id}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                    >
                      {actioning === run.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      Approve
                    </button>
                  )}
                  {run.status === "APPROVED" && (
                    <button
                      onClick={() => markPaid(run.id)}
                      disabled={actioning === run.id}
                      className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                    >
                      {actioning === run.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5" />}
                      Mark as Paid
                    </button>
                  )}
                  {run.status === "PAID" && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3.5 w-3.5" /> Paid on {run.payDate ? new Date(run.payDate).toLocaleDateString("en-PH") : "—"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
