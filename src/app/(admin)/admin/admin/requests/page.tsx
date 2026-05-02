"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Loader2, Briefcase, X, Trash2, Clock,
  Search, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, ClipboardList, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { HistoryPanel } from "@/components/admin/office-admin/HistoryPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReqStatus   = "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
type ReqPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

interface OfficeRequest {
  id:               string;
  title:            string;
  category:         string;
  priority:         ReqPriority;
  description:      string | null;
  status:           ReqStatus;
  requestedBy:      string | null;
  approvedBy:       string | null;
  rejectionReason:  string | null;
  completionNote:   string | null;
  createdAt:        string;
  updatedAt:        string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ReqStatus, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border border-amber-200",
  APPROVED:  "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  REJECTED:  "bg-red-50 text-red-700 border border-red-200",
};

const PRIORITY_COLORS: Record<ReqPriority, string> = {
  LOW:    "bg-slate-100 text-slate-500 border border-slate-200",
  NORMAL: "bg-blue-50 text-blue-600 border border-blue-200",
  HIGH:   "bg-amber-50 text-amber-700 border border-amber-200",
  URGENT: "bg-red-50 text-red-700 border border-red-200",
};

const CATEGORIES = ["Supplies", "Repair", "IT", "Facilities", "Other"];
const ALL_STATUSES: ReqStatus[] = ["PENDING", "APPROVED", "COMPLETED", "REJECTED"];

const FIELD  = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const LABEL  = "block text-xs font-medium text-slate-500 mb-1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function fmtLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── AddRequestModal ──────────────────────────────────────────────────────────

interface AddRequestModalProps {
  onClose: () => void;
  onSaved: () => void;
}

function AddRequestModal({ onClose, onSaved }: AddRequestModalProps) {
  const [form, setForm] = useState({
    title:       "",
    category:    CATEGORIES[0],
    priority:    "NORMAL" as ReqPriority,
    description: "",
    requestedBy: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError(null);
    try {
      const res  = await fetch("/api/admin/office-admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       form.title.trim(),
          category:    form.category,
          priority:    form.priority,
          description: form.description.trim() || null,
          requestedBy: form.requestedBy.trim() || null,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">New Request</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <label className={LABEL}>Title *</label>
            <input
              className={FIELD}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Brief title for this request"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Category</label>
              <select className={FIELD} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Priority</label>
              <select className={FIELD} value={form.priority} onChange={(e) => set("priority", e.target.value as ReqPriority)}>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea
              className={FIELD}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Details about the request…"
            />
          </div>
          <div>
            <label className={LABEL}>Requested By</label>
            <input
              className={FIELD}
              value={form.requestedBy}
              onChange={(e) => set("requestedBy", e.target.value)}
              placeholder="Name of requester"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Submitting…" : "Submit Request"}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ActionModal ──────────────────────────────────────────────────────────────

type ActionType = "APPROVE" | "REJECT" | "COMPLETE";

interface ActionModalProps {
  request:    OfficeRequest;
  action:     ActionType;
  onClose:    () => void;
  onDone:     () => void;
}

function ActionModal({ request, action, onClose, onDone }: ActionModalProps) {
  const [note, setNote]     = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const isReject   = action === "REJECT";
  const isApprove  = action === "APPROVE";
  const isComplete = action === "COMPLETE";

  const handleAction = async () => {
    if (isReject && !note.trim()) { setError("Rejection reason is required."); return; }
    setSaving(true); setError(null);
    try {
      const body: Record<string, string> = { action };
      if (isApprove  && note.trim()) body.approvedBy      = note.trim();
      if (isReject)                  body.rejectionReason = note.trim();
      if (isComplete && note.trim()) body.completionNote  = note.trim();

      const res  = await fetch(`/api/admin/office-admin/requests?id=${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Action failed");
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const cfg = {
    APPROVE:  { title: "Approve Request",       label: "Approved By (optional)", btn: "Approve",        btnCls: "bg-emerald-600 hover:bg-emerald-700" },
    REJECT:   { title: "Reject Request",        label: "Rejection Reason *",      btn: "Reject",         btnCls: "bg-red-600 hover:bg-red-700" },
    COMPLETE: { title: "Mark as Complete",      label: "Completion Note (optional)", btn: "Mark Complete", btnCls: "bg-indigo-600 hover:bg-indigo-700" },
  }[action];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">{cfg.title}</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            Request: <span className="font-medium text-slate-800">{request.title}</span>
          </p>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <label className={LABEL}>{cfg.label}</label>
            <textarea
              className={FIELD}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isReject ? "Why is this request being rejected?" : "Optional note…"}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAction}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg disabled:opacity-50 ${cfg.btnCls}`}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Processing…" : cfg.btn}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RequestCard ──────────────────────────────────────────────────────────────

interface RequestCardProps {
  request:     OfficeRequest;
  onDelete:    (id: string) => void;
  onAction:    (req: OfficeRequest, action: ActionType) => void;
  onHistory:   (req: OfficeRequest) => void;
  deletingId:  string | null;
}

function RequestCard({ request: r, onDelete, onAction, onHistory, deletingId }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${PRIORITY_COLORS[r.priority]}`}>
                {r.priority}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {r.category}
              </span>
            </div>
            <p className="font-semibold text-slate-900 mt-1.5 text-sm leading-snug">{r.title}</p>
            {r.requestedBy && (
              <p className="text-xs text-slate-400 mt-0.5">by {r.requestedBy}</p>
            )}
          </div>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
            {fmtLabel(r.status)}
          </span>
        </div>

        {r.description && (
          <p className={`text-xs text-slate-500 mt-2 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {r.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-slate-400">{fmtDate(r.createdAt)}</p>
          {r.description && r.description.length > 120 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700"
            >
              {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> More</>}
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (r.approvedBy || r.rejectionReason || r.completionNote) && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-slate-50 pt-3">
          {r.approvedBy && (
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">Approved by:</span> {r.approvedBy}
            </p>
          )}
          {r.rejectionReason && (
            <p className="text-xs text-slate-500">
              <span className="font-medium text-red-700">Rejection reason:</span> {r.rejectionReason}
            </p>
          )}
          {r.completionNote && (
            <p className="text-xs text-slate-500">
              <span className="font-medium text-emerald-700">Completion note:</span> {r.completionNote}
            </p>
          )}
        </div>
      )}

      {/* Actions footer */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100 flex-wrap">
        {r.status === "PENDING" && (
          <>
            <button
              onClick={() => onAction(r, "APPROVE")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              <ThumbsUp className="h-3 w-3" /> Approve
            </button>
            <button
              onClick={() => onAction(r, "REJECT")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <ThumbsDown className="h-3 w-3" /> Reject
            </button>
          </>
        )}
        {r.status === "APPROVED" && (
          <button
            onClick={() => onAction(r, "COMPLETE")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            <CheckCircle className="h-3 w-3" /> Mark Complete
          </button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => onHistory(r)}
            className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"
            title="History"
          >
            <Clock className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(r.id)}
            disabled={deletingId === r.id}
            className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg"
            title="Delete"
          >
            {deletingId === r.id
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [requests, setRequests]   = useState<OfficeRequest[]>([]);
  const [stats, setStats]         = useState({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter]     = useState<ReqStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [showAdd, setShowAdd]         = useState(false);
  const [actionState, setActionState] = useState<{ req: OfficeRequest; action: ActionType } | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ id: string; label: string } | null>(null);

  // ── load stats ─────────────────────────────────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/office-admin/requests?stats=1");
      const json = await res.json();
      if (json.success ?? json.total !== undefined) {
        setStats({
          total:     json.total     ?? 0,
          pending:   json.pending   ?? 0,
          approved:  json.approved  ?? 0,
          completed: json.completed ?? 0,
          rejected:  json.rejected  ?? 0,
        });
      }
    } catch {}
  }, []);

  // ── load requests ──────────────────────────────────────────────────────────

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusFilter)   p.set("status",   statusFilter);
      if (categoryFilter) p.set("category", categoryFilter);
      if (search.trim())  p.set("q",        search.trim());
      const qs  = p.toString();
      const res = await fetch(`/api/admin/office-admin/requests${qs ? `?${qs}` : ""}`);
      const json = await res.json();
      if (Array.isArray(json))                              setRequests(json);
      else if (json.success && Array.isArray(json.data))    setRequests(json.data);
      else if (Array.isArray(json.requests))                setRequests(json.requests);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  const reload = useCallback(() => {
    void loadStats();
    void loadRequests();
  }, [loadStats, loadRequests]);

  useEffect(() => { void loadStats(); }, [loadStats]);
  useEffect(() => { void loadRequests(); }, [loadRequests]);

  // ── delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    setDeletingId(id);
    try {
      const res  = await fetch(`/api/admin/office-admin/requests?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ── KPI data ───────────────────────────────────────────────────────────────

  const kpis = [
    { label: "Total",     value: stats.total,     color: "text-slate-700",    bg: "bg-slate-50"   },
    { label: "Pending",   value: stats.pending,   color: "text-amber-600",    bg: "bg-amber-50"   },
    { label: "Approved",  value: stats.approved,  color: "text-blue-600",     bg: "bg-blue-50"    },
    { label: "Completed", value: stats.completed, color: "text-emerald-600",  bg: "bg-emerald-50" },
    { label: "Rejected",  value: stats.rejected,  color: "text-red-600",      bg: "bg-red-50"     },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" /> Requests
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Internal office requests and approval workflows</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`border border-slate-200 rounded-xl p-4 ${k.bg}`}>
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 tabular-nums ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {([["", "All Status"], ...ALL_STATUSES.map((s) => [s, fmtLabel(s)])] as [string, string][]).map(([val, label]) => (
            <button
              key={val || "all"}
              onClick={() => setStatusFilter(val as ReqStatus | "")}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                statusFilter === val
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 flex-wrap">
          {([["", "All Categories"], ...CATEGORIES.map((c) => [c, c])] as [string, string][]).map(([val, label]) => (
            <button
              key={val || "all-cat"}
              onClick={() => setCategoryFilter(val)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                categoryFilter === val
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400">No requests found</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-3 text-xs text-indigo-500 hover:underline"
          >
            Submit first request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              onDelete={handleDelete}
              onAction={(req, action) => setActionState({ req, action })}
              onHistory={(req) => setHistoryTarget({ id: req.id, label: req.title })}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}

      {!loading && requests.length > 0 && (
        <p className="text-xs text-slate-400 text-center pt-1">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Add Modal */}
      {showAdd && (
        <AddRequestModal
          onClose={() => setShowAdd(false)}
          onSaved={reload}
        />
      )}

      {/* Action Modal */}
      {actionState && (
        <ActionModal
          request={actionState.req}
          action={actionState.action}
          onClose={() => setActionState(null)}
          onDone={reload}
        />
      )}

      {/* History Panel */}
      {historyTarget && (
        <HistoryPanel
          targetId={historyTarget.id}
          targetType="office_request"
          title={`History — ${historyTarget.label}`}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
