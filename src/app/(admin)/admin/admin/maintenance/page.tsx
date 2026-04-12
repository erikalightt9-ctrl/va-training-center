"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Wrench, X, AlertTriangle, Pencil } from "lucide-react";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

type Item = { id: string; name: string; category: string | null; quantity: number; unit: string; reorderLevel: number; location: string | null; supplier: string | null; notes: string | null; };

export default function MaintenanceInventoryPage() {
  const [items, setItems]       = useState<Item[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Item | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [form, setForm] = useState({ name:"", category:"", quantity:"0", unit:"pcs", reorderLevel:"0", location:"", supplier:"", notes:"" });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/dept/maintenance-items");
    const json = await res.json();
    if (json.success) setItems(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ name:"", category:"", quantity:"0", unit:"pcs", reorderLevel:"0", location:"", supplier:"", notes:"" });
    setShowForm(true); setError(null);
  };

  const openEdit = (item: Item) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category ?? "", quantity: String(item.quantity), unit: item.unit, reorderLevel: String(item.reorderLevel), location: item.location ?? "", supplier: item.supplier ?? "", notes: item.notes ?? "" });
    setShowForm(true); setError(null);
  };

  const handleSave = async () => {
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = { ...form, quantity: parseFloat(form.quantity), reorderLevel: parseFloat(form.reorderLevel), category: form.category || undefined, location: form.location || undefined, supplier: form.supplier || undefined, notes: form.notes || undefined };
      const url = editing ? `/api/admin/dept/maintenance-items?id=${editing.id}` : "/api/admin/dept/maintenance-items";
      const res = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const lowStock = (item: Item) => item.reorderLevel > 0 && item.quantity <= item.reorderLevel;

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maintenance Inventory</h1>
          <p className="text-sm text-slate-500">Tools, cleaning supplies, and maintenance materials</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{editing ? "Edit Item" : "Add Maintenance Item"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={LABEL}>Item Name *</label><input className={FIELD} value={form.name} onChange={(e) => set("name",e.target.value)} /></div>
              <div><label className={LABEL}>Category</label><input className={FIELD} placeholder="e.g. Cleaning, Electrical" value={form.category} onChange={(e) => set("category",e.target.value)} /></div>
              <div><label className={LABEL}>Storage Location</label><input className={FIELD} placeholder="Room / cabinet" value={form.location} onChange={(e) => set("location",e.target.value)} /></div>
              <div><label className={LABEL}>Quantity</label><input type="number" min="0" step="0.01" className={FIELD} value={form.quantity} onChange={(e) => set("quantity",e.target.value)} /></div>
              <div><label className={LABEL}>Unit</label><input className={FIELD} placeholder="pcs, liters, rolls" value={form.unit} onChange={(e) => set("unit",e.target.value)} /></div>
              <div className="col-span-2"><label className={LABEL}>Reorder Level</label><input type="number" min="0" step="0.01" className={FIELD} value={form.reorderLevel} onChange={(e) => set("reorderLevel",e.target.value)} /></div>
              <div className="col-span-2"><label className={LABEL}>Supplier</label><input className={FIELD} value={form.supplier} onChange={(e) => set("supplier",e.target.value)} /></div>
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
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400"><Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No maintenance items recorded yet.</p></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{["Item","Category","Quantity","Reorder Level","Location","Supplier",""].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50 ${lowStock(item) ? "bg-amber-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.name}
                    {lowStock(item) && <span className="ml-2 text-xs text-amber-600 font-medium inline-flex items-center gap-0.5"><AlertTriangle className="h-3 w-3" />Low</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.category ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`font-semibold ${lowStock(item) ? "text-amber-600" : "text-slate-900"}`}>{Number(item.quantity).toLocaleString()}</span><span className="text-slate-400 ml-1 text-xs">{item.unit}</span></td>
                  <td className="px-4 py-3 text-slate-500">{Number(item.reorderLevel).toLocaleString()} {item.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{item.location ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{item.supplier ?? "—"}</td>
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
