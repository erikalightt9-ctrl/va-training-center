"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, ClipboardList, X, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

type RepairLog = { id: string; itemName: string; itemType: string | null; dateReported: string; dateResolved: string | null; description: string; status: string; cost: number | null; technician: string | null; notes: string | null; };

const STATUS_OPTIONS = ["PENDING","IN_PROGRESS","COMPLETED","CANCELLED"];
const STATUS_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING:     { label: "Pending",     className: "bg-amber-50 text-amber-700 border border-amber-200",  icon: <Clock className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-50 text-blue-700 border border-blue-200",    icon: <AlertCircle className="h-3 w-3" /> },
  COMPLETED:   { label: "Completed",   className: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle className="h-3 w-3" /> },
  CANCELLED:   { label: "Cancelled",   className: "bg-slate-100 text-slate-500 border border-slate-200",icon: <XCircle className="h-3 w-3" /> },
};

export default function RepairLogsPage() {
  const [logs, setLogs]         = useState<RepairLog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<RepairLog | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [form, setForm] = useState({ itemName:"", itemType:"", dateReported: new Date().toISOString().split("T")[0], dateResolved:"", description:"", status:"PENDING", cost:"", technician:"", notes:"" });

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    const res = await fetch(`/api/admin/dept/repair-logs?${p}`);
    const json = await res.json();
    if (json.success) setLogs(json.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openEdit = (log: RepairLog) => {
    setEditing(log);
    setForm({ itemName: log.itemName, itemType: log.itemType ?? "", dateReported: log.dateReported.split("T")[0], dateResolved: log.dateResolved?.split("T")[0] ?? "", description: log.description, status: log.status, cost: log.cost?.toString() ?? "", technician: log.technician ?? "", notes: log.notes ?? "" });
    setShowForm(true); setError(null);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ itemName:"", itemType:"", dateReported: new Date().toISOString().split("T")[0], dateResolved:"", description:"", status:"PENDING", cost:"", technician:"", notes:"" });
    setShowForm(true); setError(null);
  };

  const handleSave = async () => {
    if (!form.itemName || !form.description) { setError("Item name and description are required."); return; }
    setSaving(true); setError(null);
    try {
      const body = { ...form, cost: form.cost ? parseFloat(form.cost) : undefined, itemType: form.itemType || undefined, dateResolved: form.dateResolved || undefined, technician: form.technician || undefined, notes: form.notes || undefined };
      const url = editing ? `/api/admin/dept/repair-logs?id=${editing.id}` : "/api/admin/dept/repair-logs";
      const res = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Repair Logs</h1>
          <p className="text-sm text-slate-500">Track repair requests, progress, and resolution</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Log Repair
        </button>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_STYLES[s]?.label}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{editing ? "Update Repair Log" : "Log Repair"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={LABEL}>Item Name *</label><input className={FIELD} placeholder="e.g. Aircon Unit - Room 3" value={form.itemName} onChange={(e) => set("itemName",e.target.value)} /></div>
              <div><label className={LABEL}>Item Type</label><input className={FIELD} placeholder="Appliance, Furniture..." value={form.itemType} onChange={(e) => set("itemType",e.target.value)} /></div>
              <div>
                <label className={LABEL}>Status</label>
                <select className={FIELD} value={form.status} onChange={(e) => set("status",e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_STYLES[s]?.label}</option>)}
                </select>
              </div>
              <div><label className={LABEL}>Date Reported *</label><input type="date" className={FIELD} value={form.dateReported} onChange={(e) => set("dateReported",e.target.value)} /></div>
              <div><label className={LABEL}>Date Resolved</label><input type="date" className={FIELD} value={form.dateResolved} onChange={(e) => set("dateResolved",e.target.value)} /></div>
              <div><label className={LABEL}>Technician</label><input className={FIELD} value={form.technician} onChange={(e) => set("technician",e.target.value)} /></div>
              <div><label className={LABEL}>Repair Cost (₱)</label><input type="number" min="0" className={FIELD} value={form.cost} onChange={(e) => set("cost",e.target.value)} /></div>
            </div>
            <div><label className={LABEL}>Description *</label><textarea className={FIELD} rows={3} value={form.description} onChange={(e) => set("description",e.target.value)} /></div>
            <div><label className={LABEL}>Notes</label><textarea className={FIELD} rows={2} value={form.notes} onChange={(e) => set("notes",e.target.value)} /></div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving && <Loader2 className="h-3 w-3 animate-spin" />}Save</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400"><ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No repair logs yet.</p></div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const badge = STATUS_STYLES[log.status] ?? STATUS_STYLES.PENDING;
            return (
              <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{log.itemName}</p>
                    {log.itemType && <p className="text-xs text-slate-400">{log.itemType}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>{badge.icon}{badge.label}</span>
                    <button onClick={() => openEdit(log)} className="text-xs text-teal-600 hover:underline">Edit</button>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{log.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Reported: {new Date(log.dateReported).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</span>
                  {log.dateResolved && <span>Resolved: {new Date(log.dateResolved).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</span>}
                  {log.technician  && <span>Technician: {log.technician}</span>}
                  {log.cost        && <span>Cost: ₱{Number(log.cost).toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
