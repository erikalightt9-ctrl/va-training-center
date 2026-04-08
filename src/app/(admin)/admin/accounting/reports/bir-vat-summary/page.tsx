"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Printer, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface VatBucket {
  taxableAmount: number;
  vatAmount: number;
  count: number;
}

interface ExpenseDetail {
  expenseNumber: string;
  vendor: string;
  vendorTin: string | null;
  expenseDate: string;
  amount: number;
  taxAmount: number;
}

interface VatReport {
  period: { dateFrom: string; dateTo: string };
  sales: {
    vat12: VatBucket;
    zeroRated: VatBucket;
    exempt: VatBucket;
    totalOutputVat: number;
  };
  purchases: {
    totalTaxableAmount: number;
    totalInputVat: number;
    details: ExpenseDetail[];
  };
  vatPayable: number;
  excessInputVat: number;
}

const fmt = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function getDefaultFrom() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}
function getDefaultTo() {
  return new Date().toISOString().split("T")[0];
}

export default function BirVatSummaryPage() {
  const [dateFrom, setDateFrom] = useState(getDefaultFrom());
  const [dateTo, setDateTo]     = useState(getDefaultTo());
  const [report, setReport]     = useState<VatReport | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/accounting/reports/bir-vat-summary?dateFrom=${dateFrom}&dateTo=${dateTo}`
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
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/accounting/reports" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">BIR VAT Summary</h1>
            <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">
              BIR Form 2550M / 2550Q
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Output VAT (sales) vs. Input VAT (purchases) — monthly or quarterly
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
        <div className="space-y-5 print:space-y-4">
          {/* BIR Form Header */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center print:border-black">
            <p className="text-xs font-medium text-orange-700 uppercase tracking-wider">
              Republic of the Philippines — Bureau of Internal Revenue
            </p>
            <p className="text-lg font-bold text-orange-900 mt-1">Monthly VAT Declaration (2550M)</p>
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

          {/* Part I — Output VAT (Sales) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
              <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                Part I — Output VAT (Sales / Receipts)
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-5 py-2 text-left">Transaction Type</th>
                  <th className="px-5 py-2 text-right">Taxable Amount</th>
                  <th className="px-5 py-2 text-right">VAT Amount</th>
                  <th className="px-5 py-2 text-right">Lines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800">
                    <span className="font-medium">VAT-able Sales (12%)</span>
                    <span className="ml-2 text-xs text-slate-400">standard rate</span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">
                    {fmt(report.sales.vat12.taxableAmount)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-blue-700">
                    {fmt(report.sales.vat12.vatAmount)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-400">{report.sales.vat12.count}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800">
                    <span className="font-medium">Zero-Rated Sales (0%)</span>
                    <span className="ml-2 text-xs text-slate-400">export / special</span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">
                    {fmt(report.sales.zeroRated.taxableAmount)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-400">—</td>
                  <td className="px-5 py-3 text-right text-slate-400">{report.sales.zeroRated.count}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-800">
                    <span className="font-medium">Exempt Sales</span>
                    <span className="ml-2 text-xs text-slate-400">non-VAT</span>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">
                    {fmt(report.sales.exempt.taxableAmount)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-400">—</td>
                  <td className="px-5 py-3 text-right text-slate-400">{report.sales.exempt.count}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 border-t border-blue-100">
                  <td colSpan={2} className="px-5 py-3 font-bold text-blue-800">Total Output VAT</td>
                  <td className="px-5 py-3 text-right font-bold text-blue-800">
                    {fmt(report.sales.totalOutputVat)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Part II — Input VAT (Purchases) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-purple-50 border-b border-purple-100">
              <h2 className="text-sm font-bold text-purple-800 uppercase tracking-wide">
                Part II — Input VAT (Purchases)
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-5 py-2 text-left">Expense No.</th>
                  <th className="px-5 py-2 text-left">Vendor</th>
                  <th className="px-5 py-2 text-left">Vendor TIN</th>
                  <th className="px-5 py-2 text-right">Taxable Amount</th>
                  <th className="px-5 py-2 text-right">Input VAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.purchases.details.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-slate-400 text-sm">
                      No purchases with VAT for this period
                    </td>
                  </tr>
                ) : (
                  report.purchases.details.map((e) => (
                    <tr key={e.expenseNumber} className="hover:bg-slate-50">
                      <td className="px-5 py-2 font-mono text-xs text-slate-500">{e.expenseNumber}</td>
                      <td className="px-5 py-2 text-slate-800">{e.vendor}</td>
                      <td className="px-5 py-2 text-slate-500 font-mono text-xs">{e.vendorTin ?? "—"}</td>
                      <td className="px-5 py-2 text-right text-slate-700">{fmt(Number(e.amount))}</td>
                      <td className="px-5 py-2 text-right font-medium text-purple-700">
                        {fmt(Number(e.taxAmount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50 border-t border-purple-100">
                  <td colSpan={3} className="px-5 py-3 font-bold text-purple-800">Total Input VAT</td>
                  <td className="px-5 py-3 text-right font-bold text-purple-700">
                    {fmt(report.purchases.totalTaxableAmount)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-purple-800">
                    {fmt(report.purchases.totalInputVat)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Part III — Computation of VAT Payable */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Part III — VAT Payable Computation
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="flex justify-between px-5 py-3 text-sm">
                <span className="text-slate-600">Output VAT (A)</span>
                <span className="font-medium text-slate-800">{fmt(report.sales.totalOutputVat)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 text-sm">
                <span className="text-slate-600">Less: Creditable Input VAT (B)</span>
                <span className="font-medium text-slate-800">({fmt(report.purchases.totalInputVat)})</span>
              </div>
              <div
                className={`flex justify-between px-5 py-4 text-base font-bold ${
                  report.vatPayable > 0
                    ? "bg-orange-50 text-orange-800"
                    : "bg-green-50 text-green-800"
                }`}
              >
                <span>{report.vatPayable > 0 ? "VAT Still Due (A − B)" : "Excess Input VAT (Carry Forward)"}</span>
                <span>
                  {report.vatPayable > 0
                    ? fmt(report.vatPayable)
                    : fmt(report.excessInputVat)}
                </span>
              </div>
            </div>
          </div>

          {/* BIR Note */}
          <p className="text-xs text-slate-400 text-center print:text-black">
            This report is for reference only. File BIR Form 2550M on or before the 20th day of the following month.
            Use this data to complete the official BIR eForm.
          </p>
        </div>
      )}
    </div>
  );
}
