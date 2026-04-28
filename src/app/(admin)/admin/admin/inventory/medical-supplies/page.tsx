"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Pill, Plus, Search, Loader2, AlertTriangle,
  ChevronRight, TrendingDown, Edit2, Trash2, X, Check,
  ArrowDownToLine, ArrowUpFromLine, RefreshCw, Calendar,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string;
  reorderLevel: number;
  expiryDate: string | null;
  batchNumber: string | null;
  supplier: string | null;
  notes: string | null;
}

interface Kpis { total: number; lowStock: number; outOfStock: number; expiryWarning: number; }

const STATUS = (qty: number, min: number) => {
  if (qty === 0)             return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
  if (min > 0 && qty <= min) return { label: "Low Stock",    cls: "bg-amber-100 text-amber-700" };
  return                           { label: "In Stock",    cls: "bg-emerald-100 text-emerald-700" };
};

const isExpiredOrSoon = (dateStr: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  return d <= soon;
};

const EMPTY = { name: "", category: "", quantity: "", unit: "pcs", reorderLevel: "0", expiryDate: "", batchNumber: "", supplier: "", notes: "" };

export default function MedicalSuppliesPage() {
  const [items, setItems]     = useState<Item[]>([]);
  const [kpis, setKpis]       = useState<Kpis>({ total: 0, lowStock: 0, outOfStock: 0, expiryWarning: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ ...EMPTY });
  const [editId, setEditId]   = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [stockAction, setStockAction] = useState<{ id: string; name: string; qty: number; type: "add" | "issue" } | null>(null);
  const [stockQty, setStockQty] = useState("");
  const [stockSaving, setStockSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res  = await fetch(`/api/admin/office-admin/medical-supplies?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setItems(json.data.items.map((i: Item) => ({ ...i, quantity: Number(i.quantity), reorderLevel: Number(i.reorderLevel) })));
      setKpis(json.data.kpis);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError(null);
    try {
      const body = { name: form.name, category: form.category || null, quantity: parseFloat(form.quantity) || 0, unit: form.unit, reorderLevel: parseFloat(form.reorderLevel) || 0, expiryDate: form.expiryDate || null, batchNumber: form.batchNumber || null, supplier: form.supplier || null, notes: form.notes || null };
      const url = editId ? `/api/admin/office-admin/medical-supplies?id=${editId}` : "/api/admin/office-admin/medical-supplies";
      const res  = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); setEditId(null); setForm({ ...EMPTY }); load();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleStockAction = async () => {
    if (!stockAction || !stockQty) return;
    setStockSaving(true);
    try {
      const delta = stockAction.type === "add" ? Math.abs(parseFloat(stockQty)) : -Math.abs(parseFloat(stockQty));
      const existing = items.find((i) => i.id === stockAction.id)!;
      const body = { name: existing.name, category: existing.category, quantity: stockAction.qty + delta, unit: existing.unit, reorderLevel: existing.reorderLevel, expiryDate: existing.expiryDate, batchNumber: existing.batchNumber, supplier: existing.supplier, notes: existing.notes };
      const res  = await fetch(`/api/admin/office-admin/medical-supplies?id=${stockAction.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setStockAction(null); setStockQty(""); load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setStockSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res  = await fetch(`/api/admin/office-admin/medical-supplies?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDeleteId(null); load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
  };

  const startEdit = (item: Item) => {
    setEditId(item.id);
    setForm({ name: item.name, category: item.category ?? "", quantity: String(item.quantity), unit: item.unit, reorderLevel: String(item.reorderLevel), expiryDate: item.expiryDate ?? "", batchNumber: item.batchNumber ?? "", supplier: item.supplier ?? "", notes: item.notes ?? "" });
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/admin/admin/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="h-3 w-3" /><span className="text-slate-700 font-medium">Medical Supplies</span>
      </nav>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-600 flex items-center justify-center shrink-0"><Pill className="h-5 w-5 text-white" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Medical Supplies</h1>
            <p className="text-xs text-slate-400">First aid items, medicines, and health essentials</p>
          </div>
        </div>
        <button onClick={() => { setShowForm((v) => !v); setEditId(null); setForm({ ...EMPTY }); }}
          className="flex items-center gap-2 px-3 py-2 bg-rose-600 text-white text-xs rounded-lg hover:bg-rose-700">
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Items",   value: kpis.total,         icon: <Pill className="h-4 w-4 text-rose-600" />,             cls: "" },
          { label: "Low Stock",     value: kpis.lowStock,      icon: <TrendingDown className="h-4 w-4 text-amber-500" />,    cls: kpis.lowStock > 0 ? "border-amber-200" : "" },
          { label: "Out of Stock",  value: kpis.outOfStock,    icon: <AlertTriangle className="h-4 w-4 text-red-500" />,     cls: kpis.outOfStock > 0 ? "border-red-200" : "" },
          { label: "Expiry Alerts", value: kpis.expiryWarning, icon: <Calendar className="h-4 w-4 text-orange-500" />,       cls: kpis.expiryWarning > 0 ? "border-orange-200" : "" },
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
              { key: "quantity", label: "Stock", type: "number" },
              { key: "reorderLevel", label: "Min Level", type: "number" },
              { key: "batchNumber", label: "Batch Number" },
              { key: "expiryDate", label: "Expiry Date", type: "date" },
              { key: "supplier", label: "Supplier" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input required={required} type={type ?? "text"} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 flex gap-2 justify-end mt-1">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50">
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
            </div>
          </form>
        </div>
      )}

      {stockAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">{stockAction.type === "add" ? "Add Stock" : "Issue Item"}</h2>
              <button onClick={() => setStockAction(null)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{stockAction.name} · Current: {stockAction.qty}</p>
            <input type="number" min="0.01" step="any" value={stockQty} onChange={(e) => setStockQty(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4" placeholder="Quantity" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStockAction(null)} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600">Cancel</button>
              <button onClick={handleStockAction} disabled={!stockQty || stockSaving}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50">
                {stockSaving && <Loader2 className="h-3 w-3 animate-spin" />} Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..."
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500" />
        </div>
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Item Name", "Category", "Stock", "Unit", "Min Level", "Expiry Date", "Batch No.", "Supplier", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-400">No items found</td></tr>
                ) : items.map((item) => {
                  const qty = Number(item.quantity);
                  const { label, cls } = STATUS(qty, Number(item.reorderLevel));
                  const expirySoon = isExpiredOrSoon(item.expiryDate);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.category ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">{qty}</td>
                      <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">{item.reorderLevel}</td>
                      <td className="px-4 py-3">
                        {item.expiryDate ? (
                          <span className={`text-xs font-medium ${expirySoon ? "text-orange-600" : "text-slate-500"}`}>
                            {expirySoon && "⚠ "}{new Date(item.expiryDate).toLocaleDateString("en-PH")}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{item.batchNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.supplier ?? "—"}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{label}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setStockAction({ id: item.id, name: item.name, qty, type: "add" })} title="Add Stock" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"><ArrowDownToLine className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setStockAction({ id: item.id, name: item.name, qty, type: "issue" })} title="Issue" className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"><ArrowUpFromLine className="h-3.5 w-3.5" /></button>
                          <button onClick={() => startEdit(item)} title="Edit" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 className="h-3.5 w-3.5" /></button>
                          {deleteId === item.id ? (
                            <>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
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
        </div>
      )}
    </div>
  );
}
