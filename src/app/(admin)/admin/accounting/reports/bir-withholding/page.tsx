"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ExpenseDetail {
  id: string;
  expenseNumber: string;
  vendor: string;
  vendorTin: string | null;
  expenseDate: string;
  amount: number;
  withholdingTaxRate: number | null;
  withholdingTaxAmount: number | null;
  category: string;
}

interface VendorSummary {
  vendor: string;
  tin: string | null;
  totalTaxBase: number;
  totalWithheld: number;
  transactions: number;
}

interface WithholdingReport {
  period: { dateFrom: string; dateTo: string };
  details: ExpenseDetail[];
  summary: VendorSummary[];
  totalTaxBase: number;
  totalWithheld: number;
}

const fmt = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (n: number | null) => (n != null ? `${n}%` : "—");

function getDefaultFrom() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}
function getDefaultTo() {
  return new Date().toISOString().split("T")[0];
}

export default function BirWithholdingPage() {
  const [dateFrom, setDateFrom] = useState(getDefaultFrom());
  const [dateTo, setDateTo]     = useState(getDefaultTo());
  const [report, setReport]     = useState<WithholdingReport | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/accounting/reports/bir-withholding?dateFrom=${dateFrom}&dateTo=${dateTo}`
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to generate report");
      setReport(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/accounting/reports" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Expanded Withholding Tax (EWT)</h1>
            <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">
              BIR Form 1601-EQ
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Summary of taxes withheld from suppliers and service providers
          </p>
        </div>
        {report && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        )}
      </div>

      {/* Date Range */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Period From</label>
            <input
              type="date"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Period To</label>
            <input
              type="date"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {report && (
        <div className="space-y-5">
          {/* BIR Form Header */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-orange-700 uppercase tracking-wider">
              Republic of the Philippines — Bureau of Internal Revenue
            </p>
            <p className="text-lg font-bold text-orange-900 mt-1">
              Quarterly Remittance Return of EWT (BIR Form 1601-EQ)
            </p>
            <p className="text-sm text-orange-700 mt-0.5">
              For the period:{" "}
              {new Date(report.period.dateFrom).toLocaleDateString("en-PH", {
                month: "long", day: "numeric", year: "numeric",
              })}{" "}
              to{" "}
              {new Date(report.period.dateTo).toLocaleDateString("en-PH", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Total Tax Base</p>
              <p className="text-xl font-bold text-slate-900">{fmt(report.totalTaxBase)}</p>
              <p className="text-xs text-slate-400 mt-0.5">gross amount before withholding</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Total Tax Withheld</p>
              <p className="text-xl font-bold text-orange-700">{fmt(report.totalWithheld)}</p>
              <p className="text-xs text-slate-400 mt-0.5">amount remittable to BIR</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Suppliers / Payees</p>
              <p className="text-xl font-bold text-slate-900">{report.summary.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">unique vendors with EWT</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "summary"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              By Supplier
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Transaction Details
            </button>
          </div>

          {/* Summary Table */}
          {activeTab === "summary" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  EWT Summary by Supplier / Payee
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                    <th className="px-5 py-2 text-left">Supplier / Payee</th>
                    <th className="px-5 py-2 text-left">TIN</th>
                    <th className="px-5 py-2 text-right">Transactions</th>
                    <th className="px-5 py-2 text-right">Tax Base</th>
                    <th className="px-5 py-2 text-right">EWT Withheld</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.summary.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                        No withholding tax transactions for this period
                      </td>
                    </tr>
                  ) : (
                    report.summary.map((v) => (
                      <tr key={v.vendor} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800">{v.vendor}</td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{v.tin ?? "—"}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{v.transactions}</td>
                        <td className="px-5 py-3 text-right text-slate-700">{fmt(v.totalTaxBase)}</td>
                        <td className="px-5 py-3 text-right font-semibold text-orange-700">
                          {fmt(v.totalWithheld)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-orange-50 border-t border-orange-100">
                    <td colSpan={3} className="px-5 py-3 font-bold text-orange-800">Total</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">
                      {fmt(report.totalTaxBase)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-orange-800">
                      {fmt(report.totalWithheld)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Details Table */}
          {activeTab === "details" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Transaction-Level EWT Details
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Expense No.</th>
                    <th className="px-4 py-2 text-left">Vendor</th>
                    <th className="px-4 py-2 text-left">Vendor TIN</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Tax Base</th>
                    <th className="px-4 py-2 text-right">EWT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.details.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-6 text-center text-slate-400">
                        No transactions for this period
                      </td>
                    </tr>
                  ) : (
                    report.details.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-500 text-xs">
                          {new Date(e.expenseDate).toLocaleDateString("en-PH")}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-slate-500">{e.expenseNumber}</td>
                        <td className="px-4 py-2 text-slate-800">{e.vendor}</td>
                        <td className="px-4 py-2 font-mono text-xs text-slate-500">{e.vendorTin ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-600 text-xs">{e.category}</td>
                        <td className="px-4 py-2 text-right text-slate-600">{fmtPct(e.withholdingTaxRate)}</td>
                        <td className="px-4 py-2 text-right text-slate-700">{fmt(Number(e.amount))}</td>
                        <td className="px-4 py-2 text-right font-semibold text-orange-700">
                          {fmt(Number(e.withholdingTaxAmount ?? 0))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">
            File BIR Form 1601-EQ on or before the last day of the month following the close of each quarter.
            Remit to the BIR the total EWT withheld shown above.
          </p>
        </div>
      )}
    </div>
  );
}
