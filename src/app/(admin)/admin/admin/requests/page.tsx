"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Plus, Search, Loader2, RefreshCw,
  Check, X, CheckCircle2, XCircle, Clock, ChevronDown,
  AlertTriangle, Inbox, Filter,
} from "lucide-react";

type Status   = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
type Category = "SUPPLIES" | "REPAIR" | "IT" | "FACILITIES" | "OTHER";

interface OfficeRequest {
  id: string; title: string; category: Category; description: string;
  priority: Priority; status: Status; requestedBy: string; department: string | null;
  approvedBy: string | null; approvedAt: string | null;
  rejectedBy: string | null; rejectedAt: string | null; rejectionNote: string | null;
  completedBy: string | null; completedAt: string | null; completionNote: string | null;
  createdAt: string;
}
interface Counts { PENDING: number; APPROVED: number; REJECTED: number; COMPLETED: number; }

const STATUS_CFG: Record<Status, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50", text: "text-amber-700", icon: <Clock className="h-3.5 w-3.5" /> },
  APPROVED:  { label: "Approved",  bg: "bg-blue-50",  text: "text-blue-700",  icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  COMPLETED: { label: "Completed", bg: "bg-green-50", text: "text-green-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REJECTED:  { label: "Rejected",  bg: "bg-rose-50",  text: "text-rose-700",  icon: <XCircle className="h-3.5 w-3.5" /> },
};
const PRIORITY_CFG: Record<Priority, { label: string; cls: string }> = {
  LOW:    { label: "Low",    cls: "bg-slate-100 text-slate-500" },
  NORMAL: { label: "Normal", cls: "bg-blue-100  text-blue-600"  },
  HIGH:   { label: "High",   cls: "bg-amber-100 text-amber-700" },
  URGENT: { label: "Urgent", cls: "bg-red-100   text-red-700"   },
};
const CATEGORIES: Category[] = ["SUPPLIES", "REPAIR", "IT", "FACILITIES", "OTHER"];
const catLabel = (c: string) => c.charAt(0) + c.slice(1).toLowerCase();
const fmtDate  = (d: string) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const fmtTime  = (d: string) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const EMPTY = { title: "", category: "SUPPLIES" as Category, description: "", priority: "NORMAL" as Priority, requestedBy: "", department: "" };

export default function RequestsPage() {
  const [requests, setRequests] = useState<OfficeRequest[]>([]);
  const [counts, setCounts]     = useState<Counts>({ PENDING: 0, APPROVED: 0, REJECTED: 0, COMPLETED: 0 });
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [catFilter, setCatFilter]       = useState<Category | "">("");
  const [q, setQ]               = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing]     = useState<string | null>(null);
  const [rejectModal, setRejectModal]   = useState<{ id: string } | null>(null);
  const [rejectNote, setRejectNote]     = useState("");
  const [completeModal, setCompleteModal] = useState<{ id: string } | null>(null);
  const [completeNote, setCompleteNote]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusFilter) p.set("status", statusFilter);
      if (catFilter)    p.set("category", catFilter);
      if (q)            p.set("q", q);
      const res  = await fetch(`/api/admin/office-admin/requests?${p}`);
      const json = await res.json();
      if (json.success) { setRequests(json.data); setCounts(json.counts); }
    } finally { setLoading(false); }
  }, [statusFilter, catFilter, q]);

  useEffect(() => { void load(); }, [load]);

  async function act(id: string, action: "APPROVE" | "REJECT" | "COMPLETE", note?: string) {
    setActing(id);
    try {
      const res  = await fetch("/api/admin/office-admin/requests", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, note: note ?? null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      void load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setActing(null); setRejectModal(null); setCompleteModal(null); setRejectNote(""); setCompleteNote(""); }
  }

  async function handleCreate() {
    if (!form.title || !form.description || !form.requestedBy) return alert("Title, description and requester are required.");
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/office-admin/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, department: form.department || null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); setForm({ ...EMPTY }); void load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this request?")) return;
    await fetch(`/api/admin/office-admin/requests?id=${id}`, { method: "DELETE" });
    void load();
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Requests</h1>
            <p className="text-xs text-slate-400">Internal office requests and approval workflows</p>
          </div>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">
          <Plus className="h-3.5 w-3.5" /> New Request
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {(["PENDING", "APPROVED", "COMPLETED", "REJECTED"] as const).map((s) => {
          const sc = STATUS_CFG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`rounded-xl p-3 text-center border transition-all ${statusFilter === s ? `${sc.bg} border-current ${sc.text} shadow-sm` : "bg-white border-slate-200 hover:border-slate-300"}`}>
              <div className={`text-2xl font-bold ${statusFilter === s ? sc.text : "text-slate-800"}`}>{counts[s]}</div>
              <div className={`text-xs mt-0.5 ${statusFilter === s ? sc.text : "text-slate-500"}`}>{sc.label}</div>
            </button>
          );
        })}
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">New Request</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {[{ key: "requestedBy", label: "Requested By *" }, { key: "department", label: "Department" }].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input value={(form as Record<string,string>)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {(["LOW","NORMAL","HIGH","URGENT"] as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_CFG[p].label}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search requests…"
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-2 bg-white">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value as Category | "")}
            className="text-xs text-slate-600 bg-transparent focus:outline-none">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
          </select>
        </div>
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"><RefreshCw className="h-3.5 w-3.5" /></button>
        {(statusFilter || catFilter || q) && (
          <button onClick={() => { setStatusFilter(""); setCatFilter(""); setQ(""); }} className="text-xs text-slate-400 hover:text-slate-600">Clear filters</button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
          <Inbox className="h-10 w-10 opacity-30" /><p className="text-sm">No requests found</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <ul className="divide-y divide-slate-100">
            {requests.map((req) => {
              const sc = STATUS_CFG[req.status]; const pc = PRIORITY_CFG[req.priority];
              const isOpen = expanded === req.id; const busy = acting === req.id;
              return (
                <li key={req.id}>
                  <button onClick={() => setExpanded(isOpen ? null : req.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 text-left transition-colors">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${req.priority==="URGENT"?"bg-red-500":req.priority==="HIGH"?"bg-amber-500":req.priority==="NORMAL"?"bg-blue-400":"bg-slate-300"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 truncate">{req.title}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${pc.cls}`}>{pc.label}</span>
                        <span className="text-xs text-slate-400">{catLabel(req.category)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{req.requestedBy}{req.department ? ` · ${req.department}` : ""} · {fmtDate(req.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.icon} {sc.label}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen?"rotate-180":""}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-3">
                        <div><span className="font-medium">Category:</span> {catLabel(req.category)}</div>
                        <div><span className="font-medium">Priority:</span> {pc.label}</div>
                        <div><span className="font-medium">Requested by:</span> {req.requestedBy}</div>
                        <div><span className="font-medium">Department:</span> {req.department ?? "—"}</div>
                        <div className="col-span-2"><span className="font-medium">Description:</span> {req.description}</div>
                        {req.approvedBy  && <div><span className="font-medium">Approved by:</span> {req.approvedBy} · {req.approvedAt ? fmtTime(req.approvedAt) : ""}</div>}
                        {req.completedBy && <div><span className="font-medium">Completed by:</span> {req.completedBy} · {req.completedAt ? fmtTime(req.completedAt) : ""}</div>}
                        {req.completionNote && <div className="col-span-2"><span className="font-medium">Completion note:</span> {req.completionNote}</div>}
                        {req.rejectionNote && (
                          <div className="col-span-2 flex items-start gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-2 mt-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{req.rejectionNote}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {req.status === "PENDING" && (
                          <>
                            <button onClick={() => act(req.id, "APPROVE")} disabled={busy}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg">
                              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve
                            </button>
                            <button onClick={() => { setRejectModal({ id: req.id }); setExpanded(null); }} disabled={busy}
                              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg">
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {req.status === "APPROVED" && (
                          <button onClick={() => { setCompleteModal({ id: req.id }); setExpanded(null); }} disabled={busy}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
                          </button>
                        )}
                        {(req.status === "REJECTED" || req.status === "COMPLETED") && (
                          <button onClick={() => handleDelete(req.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-100">
                            <X className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-800">Reject Request</h3>
              <textarea autoFocus rows={3} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Explain the rejection reason…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400" />
              <div className="flex gap-3">
                <button onClick={() => { setRejectModal(null); setRejectNote(""); }} className="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={() => act(rejectModal.id, "REJECT", rejectNote)} disabled={!!acting}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2">
                  {acting && <Loader2 className="h-4 w-4 animate-spin" />} Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Complete Modal */}
      {completeModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setCompleteModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-800">Mark as Complete</h3>
              <textarea autoFocus rows={3} value={completeNote} onChange={(e) => setCompleteNote(e.target.value)}
                placeholder="Any notes on how it was resolved…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <div className="flex gap-3">
                <button onClick={() => { setCompleteModal(null); setCompleteNote(""); }} className="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg hover:bg-slate-50">Cancel</button>
                <button onClick={() => act(completeModal.id, "COMPLETE", completeNote)} disabled={!!acting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2">
                  {acting && <Loader2 className="h-4 w-4 animate-spin" />} Confirm Complete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
