"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Pill, X, AlertTriangle, Pencil, ShieldAlert } from "lucide-react";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

type MedItem = {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string | null;
  notes: string | null;
};

const MEDICINE_CATEGORIES = [
  "Pain Reliever",
  "Antibiotic",
  "Antacid",
  "Antihistamine",
  "First Aid",
  "Vitamins & Supplements",
  "Cold & Flu",
  "Wound Care",
  "Eye Drops",
  "Other",
];

export default function MedicinePage() {
  const [items, setItems]       = useState<MedItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<MedItem | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [form, setForm] = useState({
    name: "", category: "First Aid", quantity: "0", unit: "pcs",
    reorderLevel: "0", supplier: "", notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/dept/medicine");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", category: "First Aid", quantity: "0", unit: "pcs", reorderLevel: "0", supplier: "", notes: "" });
    setShowForm(true);
    setError(null);
  };

  const openEdit = (item: MedItem) => {
    setEditing(item);
    setForm({
      name: item.name, category: item.category ?? "First Aid",
      quantity: String(item.quantity), unit: item.unit,
      reorderLevel: String(item.reorderLevel),
      supplier: item.supplier ?? "", notes: item.notes ?? "",
    });
    setShowForm(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name.trim(),
        category: form.category || undefined,
        quantity: parseFloat(form.quantity) || 0,
        unit: form.unit || "pcs",
        reorderLevel: parseFloat(form.reorderLevel) || 0,
        supplier: form.supplier || undefined,
        notes: form.notes || undefined,
      };
      const url = editing
        ? `/api/admin/dept/medicine?id=${editing.id}`
        : "/api/admin/dept/medicine";
      const res  = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const lowStock = (item: MedItem) => item.reorderLevel > 0 && item.quantity <= item.reorderLevel;

  const filtered = items.filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = items.filter(lowStock).length;

  return (
    <div className="p-6 max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Medicine & First Aid</h1>
          </div>
          <p className="text-sm text-slate-500">Track medicines, first aid supplies, and health essentials</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Pill className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">{items.length}</p>
            <p className="text-xs text-slate-500">Total Items</p>
          </div>
        </div>
        {lowStockCount > 0 && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-700">{lowStockCount}</p>
              <p className="text-xs text-amber-600">Low Stock</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search medicine or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Pill className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">{search ? "No items match your search" : "No medicine items yet"}</p>
            <p className="text-xs mt-1">{!search && "Add your first medicine or first aid item"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => {
                  const isLow = lowStock(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3">
                        {item.category && (
                          <span className="inline-flex px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs">
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${isLow ? "text-red-600" : "text-slate-800"}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.supplier ?? "—"}</td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{editing ? "Edit Item" : "Add Medicine / First Aid"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={LABEL}>Item Name *</label>
                <input className={FIELD} placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Category</label>
                <select className={FIELD} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {MEDICINE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Quantity</label>
                <input type="number" min="0" className={FIELD} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Unit</label>
                <select className={FIELD} value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                  {["pcs","box","bottle","pack","strip","tablet","capsule","sachet","ml","L"].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Reorder Level</label>
                <input type="number" min="0" className={FIELD} value={form.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Supplier</label>
                <input className={FIELD} placeholder="Supplier name" value={form.supplier} onChange={(e) => set("supplier", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Notes</label>
                <textarea rows={2} className={FIELD} placeholder="Storage instructions, expiry info..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
