"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNote: string | null;
  createdAt: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    position: string;
    department: string | null;
  };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700",
  APPROVED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-600",
  CANCELLED: "bg-slate-100 text-slate-500",
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  SICK: "Sick Leave", VACATION: "Vacation", EMERGENCY: "Emergency",
  MATERNITY: "Maternity", PATERNITY: "Paternity", BEREAVEMENT: "Bereavement", OTHER: "Other",
};

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [reviewing, setReviewing]       = useState<string | null>(null);
  const [reviewNote, setReviewNote]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res  = await fetch(`/api/admin/hr/leave?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRequests(json.data.data);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const review = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/admin/hr/leave/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewNote: reviewNote || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setReviewing(null);
      setReviewNote("");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Leave Requests</h1>
          <p className="text-sm text-slate-500 mt-1">{total} requests</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
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
          {requests.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No leave requests</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">
                        {req.employee.lastName}, {req.employee.firstName}
                      </span>
                      <span className="text-xs text-slate-400">{req.employee.employeeNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">{LEAVE_TYPE_LABELS[req.leaveType] ?? req.leaveType}</span>
                      {" · "}
                      {new Date(req.startDate).toLocaleDateString("en-PH")} — {new Date(req.endDate).toLocaleDateString("en-PH")}
                      {" · "}
                      <span className="font-medium">{Number(req.totalDays)} day(s)</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1 italic">"{req.reason}"</p>
                    {req.reviewNote && (
                      <p className="text-xs text-slate-400 mt-1">Note: {req.reviewNote}</p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString("en-PH")}
                  </p>
                </div>

                {req.status === "PENDING" && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {reviewing === req.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Optional note..."
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                        <button
                          onClick={() => review(req.id, "APPROVED")}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => review(req.id, "REJECTED")}
                          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                        <button onClick={() => setReviewing(null)} className="text-sm text-slate-400 hover:text-slate-600">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewing(req.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Review Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
