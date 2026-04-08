"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Receipt, CheckCircle, XCircle, Search } from "lucide-react";

interface InvoiceSummary {
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
}

interface OfficialReceipt {
  id: string;
  orNumber: string;
  invoiceId: string;
  issuedAt: string;
  status: "ISSUED" | "VOIDED";
  voidedAt: string | null;
  voidedReason: string | null;
  invoice: InvoiceSummary;
}

const fmt = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export default function OfficialReceiptsPage() {
  const [receipts, setReceipts]     = useState<OfficialReceipt[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [voidingId, setVoidingId]   = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res  = await fetch(`/api/admin/accounting/official-receipts?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setReceipts(json.data.data);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleVoid = async (id: string) => {
    if (!voidReason.trim()) return;
    try {
      const res = await fetch(`/api/admin/accounting/official-receipts/${id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: voidReason }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setVoidingId(null);
      setVoidReason("");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to void OR");
    }
  };

  const filtered = receipts.filter(
    (r) =>
      !search ||
      r.orNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.invoice.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-emerald-600" />
          Official Receipts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          BIR-compliant OR tracking — {total} total receipts issued
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search OR#, customer, invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-72"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Status</option>
          <option value="ISSUED">Issued</option>
          <option value="VOIDED">Voided</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left">OR Number</th>
                <th className="px-5 py-3 text-left">Invoice</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-left">Issued At</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No official receipts found
                  </td>
                </tr>
              ) : (
                filtered.map((or) => (
                  <tr key={or.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-semibold text-emerald-700">{or.orNumber}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{or.invoice.invoiceNumber}</td>
                    <td className="px-5 py-3 text-slate-800">{or.invoice.customerName}</td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">
                      {fmt(Number(or.invoice.totalAmount))}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {new Date(or.issuedAt).toLocaleString("en-PH")}
                    </td>
                    <td className="px-5 py-3">
                      {or.status === "ISSUED" ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle className="h-3 w-3" /> Issued
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          <XCircle className="h-3 w-3" /> Voided
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {or.status === "ISSUED" && (
                        voidingId === or.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Void reason (required)"
                              value={voidReason}
                              onChange={(e) => setVoidReason(e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-red-400"
                            />
                            <button
                              onClick={() => handleVoid(or.id)}
                              disabled={!voidReason.trim()}
                              className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => { setVoidingId(null); setVoidReason(""); }}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setVoidingId(or.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Void OR
                          </button>
                        )
                      )}
                      {or.status === "VOIDED" && or.voidedReason && (
                        <span className="text-xs text-slate-400 italic">{or.voidedReason}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
