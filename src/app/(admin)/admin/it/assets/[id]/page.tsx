"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Monitor, Loader2, AlertCircle, MapPin, Calendar, Tag, User,
  Clock, Wrench, History, Settings, Package, Shield, Plus,
  CheckCircle, ArrowLeft, UserCheck, Undo2, X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface AssetDetail {
  id: string; assetTag: string; assetName: string;
  brand: string | null; model: string | null; serialNumber: string | null;
  specs: Record<string, unknown> | null;
  purchaseDate: string | null; purchaseCost: number | null; supplier: string | null;
  warrantyStart: string | null; warrantyEnd: string | null;
  status: string; condition: string;
  assignedToId: string | null; assignedDate: string | null; location: string | null;
  notes: string | null; createdAt: string;
  category: { id: string; name: string; depreciationYears: number } | null;
  assignedTo: { id: string; firstName: string; lastName: string; position: string; email: string; department: string | null } | null;
}

interface HistoryLog {
  id: string; action: string; previousStatus: string | null; newStatus: string | null;
  remarks: string | null; createdAt: string;
  assignedTo: { firstName: string; lastName: string } | null;
  performedBy: { firstName: string; lastName: string } | null;
}

interface MaintenanceRecord {
  id: string; issueDescription: string; reportedDate: string;
  resolvedDate: string | null; status: string;
  cost: number | null; vendor: string | null; notes: string | null;
}

interface Employee {
  id: string; firstName: string; lastName: string; position: string;
}

type Tab = "overview" | "history" | "maintenance";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const peso = (n: number | null) => n != null ? `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "—";
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700", ASSIGNED: "bg-blue-100 text-blue-700",
  IN_REPAIR: "bg-amber-100 text-amber-700", FOR_DISPOSAL: "bg-red-100 text-red-600",
  RETIRED: "bg-slate-100 text-slate-500",
};

const ACTION_LABELS: Record<string, string> = {
  created: "Asset Created", assigned: "Assigned", returned: "Returned",
  status_changed: "Status Changed", repair_started: "Sent to Repair", repaired: "Repair Completed",
  disposed: "Disposed",
};

const MAINT_STATUS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700", ONGOING: "bg-blue-100 text-blue-700", RESOLVED: "bg-green-100 text-green-700",
};

/* ------------------------------------------------------------------ */
/*  Assign Modal                                                        */
/* ------------------------------------------------------------------ */

function AssignModal({ assetId, onClose, onDone }: { assetId: string; onClose: () => void; onDone: () => void }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/hr/employees?limit=500&status=ACTIVE")
      .then((r) => r.json())
      .then((j) => { if (j.success) setEmployees(j.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName} ${e.position}`.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAssign(empId: string) {
    setAssigning(empId);
    try {
      const res = await fetch(`/api/admin/it/assets/${assetId}/assign`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onDone();
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Assign to Employee</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-3 border-b border-slate-100 shrink-0">
          <input autoFocus placeholder="Search employee…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto mt-8" /> : filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No employees found</p>
          ) : filtered.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-indigo-50/30">
              <div>
                <p className="text-sm font-medium text-slate-800">{e.firstName} {e.lastName}</p>
                <p className="text-xs text-slate-400">{e.position}</p>
              </div>
              <button onClick={() => handleAssign(e.id)} disabled={assigning === e.id}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {assigning === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Assign"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Report Issue Modal                                                  */
/* ------------------------------------------------------------------ */

function ReportIssueModal({ assetId, onClose, onDone }: { assetId: string; onClose: () => void; onDone: () => void }) {
  const [desc, setDesc]       = useState("");
  const [vendor, setVendor]   = useState("");
  const [cost, setCost]       = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!desc.trim()) { setError("Description is required"); return; }
    setSaving(true); setError(null);
    try {
      const body: Record<string, unknown> = { issueDescription: desc.trim() };
      if (vendor) body.vendor = vendor;
      if (cost)   body.cost   = parseFloat(cost);
      const res = await fetch(`/api/admin/it/assets/${assetId}/maintenance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onDone(); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold text-slate-800">Report Issue</h2></div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description *</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} required
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
              <input value={vendor} onChange={(e) => setVendor(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Cost (₱)</label>
              <input type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 disabled:opacity-60">
              {saving ? "Submitting…" : "Report Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function AssetDetailPage() {
  const { id } = useParams() as { id: string };
  const [asset, setAsset]             = useState<AssetDetail | null>(null);
  const [history, setHistory]         = useState<HistoryLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<Tab>("overview");
  const [showAssign, setShowAssign]   = useState(false);
  const [showIssue, setShowIssue]     = useState(false);
  const [actioning, setActioning]     = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, hRes, mRes] = await Promise.all([
        fetch(`/api/admin/it/assets/${id}`),
        fetch(`/api/admin/it/assets/${id}/history`),
        fetch(`/api/admin/it/assets/${id}/maintenance`),
      ]);
      const [aJson, hJson, mJson] = await Promise.all([aRes.json(), hRes.json(), mRes.json()]);
      if (aJson.success) setAsset(aJson.data);
      if (hJson.success) setHistory(hJson.data);
      if (mJson.success) setMaintenance(mJson.data);
    } catch { /* */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleReturn() {
    if (!confirm("Return this asset?")) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/it/assets/${id}/return`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      loadAll();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); } finally { setActioning(false); }
  }

  async function handleStatusChange(status: string) {
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/it/assets/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      loadAll();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); } finally { setActioning(false); }
  }

  async function handleResolveMaintenance(recordId: string) {
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/it/assets/${id}/maintenance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", recordId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      loadAll();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); } finally { setActioning(false); }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
  if (!asset) return <div className="p-6"><Link href="/admin/it/assets" className="text-indigo-600 text-sm">← Back</Link><p className="mt-4 text-slate-500">Asset not found.</p></div>;

  return (
    <>
      {showAssign && <AssignModal assetId={id} onClose={() => setShowAssign(false)} onDone={loadAll} />}
      {showIssue  && <ReportIssueModal assetId={id} onClose={() => setShowIssue(false)} onDone={loadAll} />}

      <div className="p-6 space-y-6">

        {/* Back */}
        <Link href="/admin/it/assets" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />Back to Assets
        </Link>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex gap-4 items-start">
              <div className="h-14 w-14 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Monitor className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900">{asset.assetName}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[asset.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {asset.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  <span className="font-mono">{asset.assetTag}</span>
                  {asset.brand && ` · ${asset.brand}`}
                  {asset.model && ` ${asset.model}`}
                </p>
                {asset.serialNumber && <p className="text-xs text-slate-400 font-mono mt-0.5">S/N: {asset.serialNumber}</p>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              {asset.status !== "RETIRED" && !asset.assignedToId && (
                <button onClick={() => setShowAssign(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
                  <UserCheck className="h-4 w-4" />Assign
                </button>
              )}
              {asset.assignedToId && (
                <button onClick={handleReturn} disabled={actioning} className="flex items-center gap-1.5 px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-xl hover:bg-slate-700 disabled:opacity-50">
                  <Undo2 className="h-4 w-4" />Return
                </button>
              )}
              {asset.status !== "IN_REPAIR" && asset.status !== "RETIRED" && (
                <button onClick={() => setShowIssue(true)} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600">
                  <Wrench className="h-4 w-4" />Report Issue
                </button>
              )}
              {asset.status === "AVAILABLE" && (
                <button onClick={() => handleStatusChange("FOR_DISPOSAL")} disabled={actioning} className="flex items-center gap-1.5 px-3 py-2 text-red-600 border border-red-200 text-sm rounded-xl hover:bg-red-50 disabled:opacity-50">
                  Mark for Disposal
                </button>
              )}
              {asset.status === "FOR_DISPOSAL" && (
                <button onClick={() => handleStatusChange("RETIRED")} disabled={actioning} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50">
                  Retire Asset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2">
          {([
            { key: "overview", label: "Overview", icon: <Package className="h-4 w-4" /> },
            { key: "history", label: "History", icon: <History className="h-4 w-4" /> },
            { key: "maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.icon}{t.label}
              {t.key === "maintenance" && maintenance.filter((r) => r.status !== "RESOLVED").length > 0 && (
                <span className="ml-1 inline-flex h-4 w-4 rounded-full bg-red-500 text-white text-[10px] items-center justify-center font-bold">
                  {maintenance.filter((r) => r.status !== "RESOLVED").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

          {/* Overview */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Asset Details</p>
                  <div className="space-y-3">
                    {([
                      ["Category",     asset.category?.name ?? "—",      <Tag key="c" className="h-4 w-4 text-slate-400" />],
                      ["Location",     asset.location ?? "—",            <MapPin key="l" className="h-4 w-4 text-slate-400" />],
                      ["Condition",    asset.condition,                  <Shield key="co" className="h-4 w-4 text-slate-400" />],
                      ["Purchase Date",fmtDate(asset.purchaseDate),      <Calendar key="pd" className="h-4 w-4 text-slate-400" />],
                      ["Purchase Cost",peso(asset.purchaseCost),         <Settings key="pc" className="h-4 w-4 text-slate-400" />],
                      ["Supplier",     asset.supplier ?? "—",            <Package key="s" className="h-4 w-4 text-slate-400" />],
                    ] as const).map(([label, value, icon]) => (
                      <div key={label as string} className="flex items-center gap-3">
                        {icon}
                        <div className="flex-1">
                          <p className="text-xs text-slate-400">{label as string}</p>
                          <p className="text-sm text-slate-800">{value as string}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {asset.notes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Notes</p>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3">{asset.notes}</p>
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Warranty</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Warranty Period</p>
                        <p className="text-sm text-slate-800">{fmtDate(asset.warrantyStart)} — {fmtDate(asset.warrantyEnd)}</p>
                      </div>
                    </div>
                    {asset.warrantyEnd && (() => {
                      const days = Math.ceil((new Date(asset.warrantyEnd).getTime() - Date.now()) / 86400000);
                      return (
                        <div className={`rounded-xl p-3 text-sm font-medium ${
                          days < 0 ? "bg-red-50 text-red-700" : days < 30 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                        }`}>
                          {days < 0 ? `Warranty expired ${Math.abs(days)} days ago` : days < 30 ? `Warranty expires in ${days} days` : `${days} days remaining`}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Assignment</p>
                  {asset.assignedTo ? (
                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {asset.assignedTo.firstName[0]}{asset.assignedTo.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{asset.assignedTo.firstName} {asset.assignedTo.lastName}</p>
                          <p className="text-xs text-slate-500">{asset.assignedTo.position}{asset.assignedTo.department ? ` · ${asset.assignedTo.department}` : ""}</p>
                          <p className="text-xs text-slate-400">{asset.assignedTo.email}</p>
                        </div>
                      </div>
                      {asset.assignedDate && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" />Since {fmtDate(asset.assignedDate)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center">
                      <User className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-sm text-slate-400">Not assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {tab === "history" && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Audit Trail — {history.length} entries</p>
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No history logs yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      </div>
                      <div className="flex-1 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-800">{ACTION_LABELS[h.action] ?? h.action}</p>
                          {h.newStatus && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[h.newStatus] ?? "bg-slate-100 text-slate-500"}`}>
                              {h.newStatus.replace("_", " ")}
                            </span>
                          )}
                        </div>
                        {h.assignedTo && <p className="text-xs text-slate-500 mt-0.5">Employee: {h.assignedTo.firstName} {h.assignedTo.lastName}</p>}
                        {h.performedBy && <p className="text-xs text-slate-400">By: {h.performedBy.firstName} {h.performedBy.lastName}</p>}
                        {h.remarks && <p className="text-xs text-slate-400 mt-0.5">{h.remarks}</p>}
                        <p className="text-xs text-slate-300 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDateTime(h.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Maintenance */}
          {tab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{maintenance.length} records</p>
                <button onClick={() => setShowIssue(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600">
                  <Plus className="h-3.5 w-3.5" />Report Issue
                </button>
              </div>
              {maintenance.length === 0 ? (
                <div className="text-center py-8"><Wrench className="h-8 w-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-400">No maintenance records</p></div>
              ) : (
                <div className="space-y-3">
                  {maintenance.map((m) => (
                    <div key={m.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MAINT_STATUS[m.status] ?? "bg-slate-100 text-slate-500"}`}>
                              {m.status}
                            </span>
                            {m.vendor && <span className="text-xs text-slate-400">Vendor: {m.vendor}</span>}
                          </div>
                          <p className="text-sm text-slate-800 mt-1.5">{m.issueDescription}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>Reported: {fmtDate(m.reportedDate)}</span>
                            {m.resolvedDate && <span>Resolved: {fmtDate(m.resolvedDate)}</span>}
                            {m.cost != null && <span>Cost: {peso(m.cost)}</span>}
                          </div>
                        </div>
                        {m.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleResolveMaintenance(m.id)}
                            disabled={actioning}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 shrink-0"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
