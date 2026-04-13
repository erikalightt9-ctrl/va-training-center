"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, PackageOpen, X, Pencil, AlertTriangle } from "lucide-react";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

type Equipment = { id: string; name: string; serialNumber: string | null; category: string | null; location: string | null; purchaseDate: string | null; warrantyExpiry: string | null; status: string; notes: string | null; };

const STATUS_OPTIONS = ["ACTIVE","FOR_REPAIR","IN_REPAIR","FOR_DISPOSE","DISPOSED","FOR_SALE","SOLD","UNDER_WARRANTY"];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE:"bg-green-50 text-green-700 border border-green-200", FOR_REPAIR:"bg-amber-50 text-amber-700 border border-amber-200",
  IN_REPAIR:"bg-orange-50 text-orange-700 border border-orange-200", FOR_DISPOSE:"bg-red-50 text-red-700 border border-red-200",
  DISPOSED:"bg-slate-100 text-slate-500 border border-slate-200", FOR_SALE:"bg-purple-50 text-purple-700 border border-purple-200",
  SOLD:"bg-slate-100 text-slate-600 border border-slate-300", UNDER_WARRANTY:"bg-blue-50 text-blue-700 border border-blue-200",
};
const fmt = (s: string) => s.replace(/_/g, " ");

export default function EquipmentPage() {
  const [items, setItems]       = useState<Equipment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Equipment | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [form, setForm] = useState({ name:"", serialNumber:"", category:"", location:"", purchaseDate:"", warrantyExpiry:"", status:"ACTIVE", notes:"" });

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    const res = await fetch(`/api/admin/dept/equipment?${p}`);
    const json = await res.json();
    if (json.success) setItems(json.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => { setEditing(null); setForm({ name:"", serialNumber:"", category:"", location:"", purchaseDate:"", warrantyExpiry:"", status:"ACTIVE", notes:"" }); setShowForm(true); setError(null); };
  const openEdit = (e: Equipment) => {
    setEditing(e);
    setForm({ name: e.name, serialNumber: e.serialNumber ?? "", category: e.category ?? "", location: e.location ?? "", purchaseDate: e.purchaseDate?.split("T")[0] ?? "", warrantyExpiry: e.warrantyExpiry?.split("T")[0] ?? "", status: e.status, notes: e.notes ?? "" });
    setShowForm(true); setError(null);
  };

  const handleSave = async () => {
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = { ...form, serialNumber: form.serialNumber || undefined, category: form.category || undefined, location: form.location || undefined, purchaseDate: form.purchaseDate || undefined, warrantyExpiry: form.warrantyExpiry || undefined, notes: form.notes || undefined };
      const url = editing ? `/api/admin/dept/equipment?id=${editing.id}` : "/api/admin/dept/equipment";
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
          <h1 className="text-xl font-bold text-slate-900">Appliances & Furniture</h1>
          <p className="text-sm text-slate-500">Track appliances and furniture — status, repairs, disposals, and sales</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{fmt(s)}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{editing ? "Edit Equipment" : "Add Equipment"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={LABEL}>Name *</label><input className={FIELD} value={form.name} onChange={(e) => set("name",e.target.value)} /></div>
              <div><label className={LABEL}>Serial Number</label><input className={FIELD} value={form.serialNumber} onChange={(e) => set("serialNumber",e.target.value)} /></div>
              <div><label className={LABEL}>Category</label><input className={FIELD} placeholder="Printer, Projector..." value={form.category} onChange={(e) => set("category",e.target.value)} /></div>
              <div><label className={LABEL}>Location</label><input className={FIELD} placeholder="Room / area" value={form.location} onChange={(e) => set("location",e.target.value)} /></div>
              <div>
                <label className={LABEL}>Status</label>
                <select className={FIELD} value={form.status} onChange={(e) => set("status",e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{fmt(s)}</option>)}
                </select>
              </div>
              <div><label className={LABEL}>Purchase Date</label><input type="date" className={FIELD} value={form.purchaseDate} onChange={(e) => set("purchaseDate",e.target.value)} /></div>
              <div><label className={LABEL}>Warranty Expiry</label><input type="date" className={FIELD} value={form.warrantyExpiry} onChange={(e) => set("warrantyExpiry",e.target.value)} /></div>
            </div>
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
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400"><PackageOpen className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No equipment recorded yet.</p></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{["Name","Serial No.","Category","Location","Status","Warranty",""].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.serialNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{item.category ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{item.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] ?? ""}`}>{fmt(item.status)}</span>
                    {(item.status === "FOR_REPAIR" || item.status === "IN_REPAIR") && <AlertTriangle className="h-3 w-3 text-amber-500 inline ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.warrantyExpiry ? (
                      <span className={new Date(item.warrantyExpiry) < new Date() ? "text-red-500" : ""}>
                        {new Date(item.warrantyExpiry).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3"><button onClick={() => openEdit(item)} className="text-teal-600 hover:text-teal-800"><Pencil className="h-3.5 w-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
