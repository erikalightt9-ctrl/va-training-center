"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Archive, Plus, Search, Loader2, AlertTriangle,
  ChevronRight, TrendingDown, Edit2, Trash2, X, Check,
  ArrowDownToLine, ArrowRightLeft, RefreshCw, Filter,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string | null;
  supplier: string | null;
}

interface Kpis { total: number; lowStock: number; outOfStock: number; }

const STATUS = (qty: number, min: number) => {
  if (qty === 0)             return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
  if (min > 0 && qty <= min) return { label: "Low Stock",    cls: "bg-amber-100 text-amber-700" };
  return                           { label: "In Stock",    cls: "bg-emerald-100 text-emerald-700" };
};

const EMPTY = { name: "", category: "General", quantity: "", unit: "pcs", minThreshold: "0", location: "", supplier: "" };

export default function StockroomPage() {
  const [items, setItems]       = useState<Item[]>([]);
  const [kpis, setKpis]         = useState<Kpis>({ total: 0, lowStock: 0, outOfStock: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });
  const [editId, setEditId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<{ id: string; name: string; qty: number } | null>(null);
  const [bulkQty, setBulkQty]   = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (search)    params.set("search", search);
      if (filterCat) params.set("category", filterCat);
      const res  = await fetch(`/api/admin/office-admin/stockroom?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setItems(json.data.items.map((i: Item) => ({ ...i, quantity: Number(i.quantity), minThreshold: Number(i.minThreshold) })));
      setKpis(json.data.kpis);
      setCategories(json.data.categories ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, [search, filterCat]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError(null);
    try {
      const body = { name: form.name, category: form.category || "General", quantity: parseFloat(form.quantity) || 0, unit: form.unit, minThreshold: parseFloat(form.minThreshold) || 0, location: form.location || null, supplier: form.supplier || null };
      const url = editId ? `/api/admin/office-admin/stockroom?id=${editId}` : "/api/admin/office-admin/stockroom";
      const res  = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); setEditId(null); setForm({ ...EMPTY }); load();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleBulkAdd = async () => {
    if (!bulkAction || !bulkQty) return;
    setBulkSaving(true);
    try {
      const res  = await fetch(`/api/admin/office-admin/stockroom?id=${bulkAction.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: bulkAction.qty + Math.abs(parseFloat(bulkQty)) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setBulkAction(null); setBulkQty(""); load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setBulkSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res  = await fetch(`/api/admin/office-admin/stockroom?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDeleteId(null); load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
  };

  const startEdit = (item: Item) => {
    setEditId(item.id);
    setForm({ name: item.name, category: item.category, quantity: String(item.quantity), unit: item.unit, minThreshold: String(item.minThreshold), location: item.location ?? "", supplier: item.supplier ?? "" });
    setShowForm(true);
  };

  const grouped = items.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] ?? []).push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/admin/admin/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="h-3 w-3" /><span className="text-slate-700 font-medium">Stockroom</span>
      </nav>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-600 flex items-center justify-center shrink-0"><Archive className="h-5 w-5 text-white" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Stockroom</h1>
            <p className="text-xs text-slate-400">Bulk storage, department transfers, and bin management</p>
          </div>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setEditId(null); setForm({ ...EMPTY }); }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-800">
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Items",  value: kpis.total,      icon: <Archive className="h-4 w-4 text-slate-600" />,      cls: "" },
          { label: "Low Stock",    value: kpis.lowStock,   icon: <TrendingDown className="h-4 w-4 text-amber-500" />, cls: kpis.lowStock > 0 ? "border-amber-200" : "" },
          { label: "Out of Stock", value: kpis.outOfStock, icon: <AlertTriangle className="h-4 w-4 text-red-500" />,  cls: kpis.outOfStock > 0 ? "border-red-200" : "" },
        ].map((k) => (
          <div key={k.label} className={`bg-white border rounded-xl p-4 ${k.cls || "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-slate-500">{k.label}</p>{k.icon}</div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">{editId ? "Edit Item" : "Add Item"}</h2>
          {formError && <p className="text-xs text-red-600 mb-3">{formError}</p>}
          <form onSubmit={handleSave} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: "name", label: "Item Name *", required: true },
              { key: "category", label: "Category" },
              { key: "unit", label: "Unit" },
              { key: "quantity", label: "Bulk Qty", type: "number" },
              { key: "minThreshold", label: "Min Level", type: "number" },
              { key: "location", label: "Bin / Location" },
              { key: "supplier", label: "Supplier" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input required={required} type={type ?? "text"} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 flex gap-2 justify-end mt-1">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
            </div>
          </form>
        </div>
      )}

      {bulkAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">Add Bulk Stock</h2>
              <button onClick={() => setBulkAction(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{bulkAction.name} · Current: {bulkAction.qty}</p>
            <input type="number" min="0.01" step="any" value={bulkQty} onChange={(e) => setBulkQty(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4" placeholder="Quantity to add" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setBulkAction(null)} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600">Cancel</button>
              <button onClick={handleBulkAdd} disabled={!bulkQty || bulkSaving}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                {bulkSaving && <Loader2 className="h-3 w-3 animate-spin" />} Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..."
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-500" />
        </div>
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="text-xs text-slate-600 bg-transparent focus:outline-none">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : filterCat ? (
        /* Flat view when filtered */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <StockTable items={items} onBulkAdd={(item) => setBulkAction({ id: item.id, name: item.name, qty: item.quantity })} onEdit={startEdit} deleteId={deleteId} setDeleteId={setDeleteId} onDelete={handleDelete} />
        </div>
      ) : (
        /* Grouped by category */
        <div className="space-y-4">
          {Object.keys(grouped).length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-sm text-slate-400">No items found</div>
          ) : Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{cat}</span>
                <span className="text-xs text-slate-400">{catItems.length} item{catItems.length !== 1 ? "s" : ""}</span>
              </div>
              <StockTable items={catItems} onBulkAdd={(item) => setBulkAction({ id: item.id, name: item.name, qty: item.quantity })} onEdit={startEdit} deleteId={deleteId} setDeleteId={setDeleteId} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StockTable({ items, onBulkAdd, onEdit, deleteId, setDeleteId, onDelete }: {
  items: Item[];
  onBulkAdd: (item: Item) => void;
  onEdit: (item: Item) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            {["Item Name", "Bulk Qty", "Unit", "Min Level", "Location", "Supplier", "Status", "Actions"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const qty = Number(item.quantity);
            const { label, cls } = STATUS(qty, Number(item.minThreshold));
            return (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">{qty}</td>
                <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                <td className="px-4 py-3 text-slate-500 tabular-nums">{item.minThreshold}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{item.location ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{item.supplier ?? "—"}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{label}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onBulkAdd(item)} title="Add Bulk Stock" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"><ArrowDownToLine className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onEdit(item)} title="Edit" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="h-3.5 w-3.5" /></button>
                    {deleteId === item.id ? (
                      <>
                        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteId(item.id)} title="Delete" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
