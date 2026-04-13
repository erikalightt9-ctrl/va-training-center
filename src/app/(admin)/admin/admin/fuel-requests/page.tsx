"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Fuel, CheckCircle, XCircle, Clock, MessageSquare, X, Car } from "lucide-react";

type FuelRequest = {
  id: string;
  date: string;
  vehicleInfo: string | null;
  odometer: number | null;
  liters: number;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  employee: { id: string; firstName: string; lastName: string; employeeNumber: string };
};

const STATUS_BADGE: Record<FuelRequest["status"], { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  PENDING:  { label: "Pending",  icon: Clock,        className: "bg-amber-50 text-amber-700 border border-amber-200"  },
  APPROVED: { label: "Approved", icon: CheckCircle,  className: "bg-green-50 text-green-700 border border-green-200"  },
  REJECTED: { label: "Rejected", icon: XCircle,      className: "bg-red-50 text-red-700 border border-red-200"        },
};

export default function AdminFuelRequestsPage() {
  const [requests, setRequests]   = useState<FuelRequest[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewing, setReviewing] = useState<{ id: string; action: "APPROVED" | "REJECTED" } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [saving, setSaving]       = useState(false);
  const [message, setMessage]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res  = await fetch(`/api/admin/hr/fuel-requests?${params}`);
      const json = await res.json();
      if (json.success) { setRequests(json.data.data); setTotal(json.data.total); }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleReview = async () => {
    if (!reviewing) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/hr/fuel-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewing.id, status: reviewing.action, reviewNote: reviewNote || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setMessage({ type: "success", text: `Request ${reviewing.action.toLowerCase()} successfully.` });
      setReviewing(null);
      setReviewNote("");
      fetchRequests();
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const pending  = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Fuel className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Fuel Requests</h1>
          </div>
          <p className="text-sm text-slate-500">Review and approve driver fuel/gas requests</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Car className="h-4 w-4" />
          <span>{total} total requests</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending",  count: pending,  color: "bg-amber-50 border-amber-200 text-amber-700",  icon: Clock },
          { label: "Approved", count: approved, color: "bg-green-50 border-green-200 text-green-700",  icon: CheckCircle },
          { label: "Rejected", count: rejected, color: "bg-red-50 border-red-200 text-red-700",        icon: XCircle },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl border p-3 flex items-center gap-3 ${color}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-lg font-bold leading-none">{count}</p>
              <p className="text-xs mt-0.5 opacity-80">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Feedback */}
      {message && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm border ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          {message.text}
          <button className="ml-auto" onClick={() => setMessage(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Fuel className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No fuel requests found</p>
            <p className="text-xs mt-1">Requests submitted by drivers will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Liters</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Purpose</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((req) => {
                  const badge = STATUS_BADGE[req.status];
                  const Icon  = badge.icon;
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{req.employee.firstName} {req.employee.lastName}</p>
                        <p className="text-xs text-slate-400">{req.employee.employeeNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{new Date(req.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{req.vehicleInfo ?? "—"}{req.odometer ? ` · ${req.odometer.toLocaleString()} km` : ""}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{req.liters}L</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{req.purpose}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {req.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setReviewing({ id: req.id, action: "APPROVED" }); setReviewNote(""); }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3" /> Approve
                            </button>
                            <button
                              onClick={() => { setReviewing({ id: req.id, action: "REJECTED" }); setReviewNote(""); }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </button>
                          </div>
                        )}
                        {req.status !== "PENDING" && req.reviewNote && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <MessageSquare className="h-3 w-3" />
                            {req.reviewNote}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                {reviewing.action === "APPROVED" ? "Approve Request" : "Reject Request"}
              </h2>
              <button onClick={() => setReviewing(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Review Note (optional)</label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setReviewing(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={saving}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 ${
                  reviewing.action === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {reviewing.action === "APPROVED" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
