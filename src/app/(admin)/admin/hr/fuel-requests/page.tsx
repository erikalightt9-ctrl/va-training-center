"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Fuel, CheckCircle, XCircle, Clock, MessageSquare, X } from "lucide-react";

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

const STATUS_BADGE: Record<FuelRequest["status"], { label: string; className: string }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border border-amber-200"  },
  APPROVED: { label: "Approved", className: "bg-green-50 text-green-700 border border-green-200"  },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border border-red-200"        },
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

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fuel Requests</h1>
        <p className="text-sm text-slate-500">Review driver fuel/gas requests</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-lg p-3 text-sm border ${
          message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="h-3 w-3" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <span className="text-xs text-slate-500">{total} total</span>
      </div>

      {/* Review modal */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-slate-800">
              {reviewing.action === "APPROVED" ? "Approve" : "Reject"} Fuel Request
            </h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Note (optional)</label>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Add a review note..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReview}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg disabled:opacity-50 ${
                  reviewing.action === "APPROVED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirm {reviewing.action === "APPROVED" ? "Approval" : "Rejection"}
              </button>
              <button
                onClick={() => { setReviewing(null); setReviewNote(""); }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <Fuel className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No fuel requests found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Liters</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Purpose</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => {
                const badge = STATUS_BADGE[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{r.employee.lastName}, {r.employee.firstName}</p>
                      <p className="text-xs text-slate-400">{r.employee.employeeNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(r.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{Number(r.liters).toFixed(2)} L</td>
                    <td className="px-4 py-3 text-slate-500">{r.vehicleInfo ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{r.purpose}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                        {r.status === "PENDING"  && <Clock className="h-3 w-3" />}
                        {r.status === "APPROVED" && <CheckCircle className="h-3 w-3" />}
                        {r.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {badge.label}
                      </span>
                      {r.reviewNote && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {r.reviewNote}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "PENDING" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setReviewing({ id: r.id, action: "APPROVED" }); setMessage(null); }}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setReviewing({ id: r.id, action: "REJECTED" }); setMessage(null); }}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
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
  );
}
