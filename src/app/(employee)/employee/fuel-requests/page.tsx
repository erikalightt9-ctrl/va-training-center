"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Fuel, Plus, X, CheckCircle, Clock, XCircle } from "lucide-react";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const LABEL = "block text-xs text-slate-500 mb-1";

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
};

const STATUS_BADGE: Record<FuelRequest["status"], { label: string; className: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Pending",  className: "bg-amber-50 text-amber-700 border border-amber-200",  icon: <Clock className="h-3 w-3" />    },
  APPROVED: { label: "Approved", className: "bg-green-50 text-green-700 border border-green-200",  icon: <CheckCircle className="h-3 w-3" /> },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border border-red-200",        icon: <XCircle className="h-3 w-3" />   },
};

export default function FuelRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    date:        new Date().toISOString().split("T")[0],
    vehicleInfo: "",
    odometer:    "",
    liters:      "",
    purpose:     "",
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employee/fuel-requests");
      const json = await res.json();
      if (json.success) setRequests(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/employee/login"); return; }
    if (status === "authenticated") {
      if (session.user.portalRole !== "DRIVER") { router.push("/employee/attendance"); return; }
      fetchRequests();
    }
  }, [status, session, router, fetchRequests]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.date || !form.liters || !form.purpose) {
      setError("Date, liters, and purpose are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/employee/fuel-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:        form.date,
          vehicleInfo: form.vehicleInfo || undefined,
          odometer:    form.odometer ? parseInt(form.odometer) : undefined,
          liters:      parseFloat(form.liters),
          purpose:     form.purpose,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSuccess("Fuel request submitted successfully.");
      setShowForm(false);
      setForm({ date: new Date().toISOString().split("T")[0], vehicleInfo: "", odometer: "", liters: "", purpose: "" });
      fetchRequests();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Fuel className="h-6 w-6 text-indigo-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">Fuel Requests</h1>
              <p className="text-xs text-slate-500">Log your gas/fuel consumption</p>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(null); setSuccess(null); }}
            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" /> {success}
          </div>
        )}

        {/* New Request Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">New Fuel Request</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Date *</label>
                <input type="date" className={FIELD} value={form.date} onChange={(e) => set("date", e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Liters *</label>
                <input type="number" step="0.01" min="0" className={FIELD} placeholder="e.g. 20.5" value={form.liters} onChange={(e) => set("liters", e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Vehicle Info</label>
                <input className={FIELD} placeholder="Plate no. / model" value={form.vehicleInfo} onChange={(e) => set("vehicleInfo", e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Odometer (km)</label>
                <input type="number" min="0" className={FIELD} placeholder="e.g. 45200" value={form.odometer} onChange={(e) => set("odometer", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Purpose *</label>
              <textarea className={FIELD} rows={2} placeholder="Delivery route, client visit, etc." value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                Submit Request
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <Fuel className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No fuel requests yet.</p>
            <p className="text-xs mt-1">Tap &quot;New Request&quot; to log your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const badge = STATUS_BADGE[r.status];
              return (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{new Date(r.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}</p>
                      <p className="text-xs text-slate-500">{r.purpose}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    <span><span className="text-slate-400">Liters:</span> {Number(r.liters).toFixed(2)} L</span>
                    {r.vehicleInfo && <span><span className="text-slate-400">Vehicle:</span> {r.vehicleInfo}</span>}
                    {r.odometer    && <span><span className="text-slate-400">Odometer:</span> {r.odometer.toLocaleString()} km</span>}
                  </div>
                  {r.reviewNote && (
                    <p className="text-xs text-slate-500 bg-slate-50 rounded p-2">
                      <span className="font-medium">Note:</span> {r.reviewNote}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
