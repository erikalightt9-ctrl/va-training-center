"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Plus, Loader2, CheckCircle2, Clock,
  XCircle, AlertCircle, ChevronDown, ShoppingBag,
} from "lucide-react";

interface SupplyRequest {
  id:              string;
  itemName:        string;
  quantity:        number;
  unit:            string;
  purpose:         string;
  status:          string;
  createdAt:       string;
  approvedAt?:     string;
  completedAt?:    string;
  rejectedAt?:     string;
  rejectionReason?: string;
  approvalNote?:   string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-700",  icon: <Clock        className="h-3.5 w-3.5" /> },
  APPROVED:  { label: "Approved",  bg: "bg-blue-50",   text: "text-blue-700",   icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  COMPLETED: { label: "Fulfilled", bg: "bg-green-50",  text: "text-green-700",  icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REJECTED:  { label: "Rejected",  bg: "bg-rose-50",   text: "text-rose-700",   icon: <XCircle      className="h-3.5 w-3.5" /> },
};

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const UNITS = ["piece", "pack", "box", "ream", "bottle", "set", "roll", "pair", "bag", "carton"];
const INITIAL_FORM = { itemName: "", quantity: 1, unit: "piece", purpose: "" };

export default function EmployeeSupplyRequestsPage() {
  const [requests, setRequests]     = useState<SupplyRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState(INITIAL_FORM);
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [flash, setFlash]           = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/employee/supply-requests");
      const json = await res.json() as { success: boolean; data: SupplyRequest[] };
      if (json.success) setRequests(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.itemName.trim() || !form.purpose.trim()) return;
    setSubmitting(true);
    try {
      const res  = await fetch("/api/employee/supply-requests", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (json.success) {
        setFlash({ type: "success", text: "Request submitted. Your manager has been notified." });
        setForm(INITIAL_FORM);
        setShowForm(false);
        void load();
      } else {
        setFlash({ type: "error", text: json.error ?? "Failed to submit request." });
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => setFlash(null), 5000);
    }
  }

  const pending   = requests.filter((r) => r.status === "PENDING").length;
  const approved  = requests.filter((r) => r.status === "APPROVED").length;
  const fulfilled = requests.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Supply Requests</h1>
              <p className="text-xs text-slate-500">Request office supplies from inventory</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        </div>

        {/* Flash */}
        {flash && (
          <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
            flash.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {flash.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {flash.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending",   value: pending,   color: "text-amber-600",  bg: "bg-amber-50"  },
            { label: "Approved",  value: approved,  color: "text-blue-600",   bg: "bg-blue-50"   },
            { label: "Fulfilled", value: fulfilled, color: "text-green-600",  bg: "bg-green-50"  },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">New Supply Request</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Item Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Ballpen, Tissue Paper, Folder…"
                  value={form.itemName}
                  onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>

              {/* Quantity + Unit */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quantity <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Purpose / Reason <span className="text-rose-500">*</span></label>
                <textarea
                  placeholder="Brief description of why you need this item…"
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(INITIAL_FORM); }}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? "Submitting…" : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Request List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">My Requests</h2>
            <span className="text-xs text-slate-400">{requests.length} total</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
              <Package className="h-10 w-10 opacity-30" />
              <p className="text-sm">No requests yet. Submit your first request above.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {requests.map((req) => {
                const sc     = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.PENDING;
                const isOpen = expanded === req.id;
                return (
                  <li key={req.id}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : req.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 truncate">{req.itemName}</span>
                          <span className="text-xs text-slate-400 shrink-0">
                            ×{req.quantity} {req.unit}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{req.purpose}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                          {sc.icon} {sc.label}
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(req.createdAt)}</span>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                        <div><span className="font-medium">Submitted:</span> {new Date(req.createdAt).toLocaleString("en-PH")}</div>
                        {req.approvedAt  && <div><span className="font-medium">Approved:</span>  {new Date(req.approvedAt).toLocaleString("en-PH")}</div>}
                        {req.completedAt && <div><span className="font-medium">Fulfilled:</span> {new Date(req.completedAt).toLocaleString("en-PH")}</div>}
                        {req.rejectedAt  && <div><span className="font-medium">Rejected:</span>  {new Date(req.rejectedAt).toLocaleString("en-PH")}</div>}
                        {req.rejectionReason && (
                          <div className="flex items-start gap-1.5 mt-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg px-3 py-2">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{req.rejectionReason}</span>
                          </div>
                        )}
                        {req.approvalNote && req.status === "APPROVED" && (
                          <div className="mt-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-2">{req.approvalNote}</div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
