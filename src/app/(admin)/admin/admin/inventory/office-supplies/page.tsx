"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package, Plus, Search, Download, Loader2, AlertTriangle,
  ChevronRight, TrendingDown, Edit2, Trash2, X, Check,
  ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, RefreshCw,
} from "lucide-react";

interface Item {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  totalStock: number;
  minThreshold: number;
  location: string | null;
  category: { id: string; name: string; icon: string | null } | null;
  description: string | null;
}

interface Kpis {
  total: number;
  lowStock: number;
  outOfStock: number;
  monthlyUsage: number;
}

type ActionType = "add_stock" | "issue" | "adjust";

const STATUS = (qty: number, min: number) => {
  if (qty === 0)            return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
  if (min > 0 && qty <= min) return { label: "Low Stock",    cls: "bg-amber-100 text-amber-700" };
  return                          { label: "In Stock",     cls: "bg-emerald-100 text-emerald-700" };
};

export default function OfficeSuppliesPage() {
  const [items, setItems]       = useState<Item[]>([]);
  const [kpis, setKpis]         = useState<Kpis>({ total: 0, lowStock: 0, outOfStock: 0, monthlyUsage: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", sku: "", unit: "pcs", totalStock: "", minThreshold: "0", location: "", description: "" });
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [actionItem, setActionItem] = useState<{ id: string; name: string; stock: number; type: ActionType } | null>(null);
  const [actionQty, setActionQty] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res  = await fetch(`/api/admin/inventory/items?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const allItems: Item[] = json.data.data ?? json.data ?? [];
      setItems(allItems);

      const low  = allItems.filter((i) => { const q = Number(i.totalStock), m = Number(i.minThreshold); return q > 0 && m > 0 && q <= m; }).length;
      const out  = allItems.filter((i) => Number(i.totalStock) === 0).length;

      // Monthly usage from movements
      const usageRes  = await fetch("/api/admin/inventory/movements?type=OUT&period=month");
      const usageJson = await usageRes.json();
      const usage = usageJson.success ? (usageJson.data?.total ?? 0) : 0;

      setKpis({ total: allItems.length, lowStock: low, outOfStock: out, monthlyUsage: usage });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const body = {
        name: form.name, sku: form.sku || null, unit: form.unit,
        totalStock: parseFloat(form.totalStock) || 0,
        minThreshold: parseFloat(form.minThreshold) || 0,
        location: form.location || null, description: form.description || null,
      };
      const res  = await fetch(editId ? `/api/admin/inventory/items?id=${editId}` : "/api/admin/inventory/items", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false);
      setEditId(null);
      setForm({ name: "", sku: "", unit: "pcs", totalStock: "", minThreshold: "0", location: "", description: "" });
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async () => {
    if (!actionItem || !actionQty) return;
    setActionSaving(true);
    try {
      const qty = parseFloat(actionQty);
      const body = {
        itemId:   actionItem.id,
        type:     actionItem.type === "add_stock" ? "IN" : actionItem.type === "issue" ? "OUT" : "ADJUST",
        quantity: actionItem.type === "issue" ? -Math.abs(qty) : Math.abs(qty),
        note:     actionNote || null,
      };
      const res  = await fetch("/api/admin/inventory/movements", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setActionItem(null);
      setActionQty("");
      setActionNote("");
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setActionSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res  = await fetch(`/api/admin/inventory/items?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDeleteId(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  const startEdit = (item: Item) => {
    setEditId(item.id);
    setForm({
      name: item.name, sku: item.sku ?? "", unit: item.unit,
      totalStock: String(item.totalStock), minThreshold: String(item.minThreshold),
      location: item.location ?? "", description: item.description ?? "",
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/admin/admin/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700 font-medium">Office Supplies</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Office Supplies</h1>
            <p className="text-xs text-slate-400">Stationery, consumables, and department items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowForm((v) => !v); setEditId(null); setForm({ name: "", sku: "", unit: "pcs", totalStock: "", minThreshold: "0", location: "", description: "" }); }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Items",    value: kpis.total,        icon: <Package className="h-4 w-4 text-blue-600" />,        cls: "" },
          { label: "Low Stock",      value: kpis.lowStock,     icon: <TrendingDown className="h-4 w-4 text-amber-500" />,  cls: kpis.lowStock > 0 ? "border-amber-200" : "" },
          { label: "Out of Stock",   value: kpis.outOfStock,   icon: <AlertTriangle className="h-4 w-4 text-red-500" />,   cls: kpis.outOfStock > 0 ? "border-red-200" : "" },
          { label: "Monthly Usage",  value: kpis.monthlyUsage, icon: <ArrowUpFromLine className="h-4 w-4 text-slate-500" />, cls: "" },
        ].map((k) => (
          <div key={k.label} className={`bg-white border rounded-xl p-4 ${k.cls || "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">{k.label}</p>
              {k.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">{editId ? "Edit Item" : "Add Item"}</h2>
          {formError && <p className="text-xs text-red-600 mb-3">{formError}</p>}
          <form onSubmit={handleSave} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: "name", label: "Item Name *", required: true },
              { key: "sku",  label: "SKU" },
              { key: "unit", label: "Unit" },
              { key: "totalStock",  label: "Stock",    type: "number" },
              { key: "minThreshold",label: "Min Level", type: "number" },
              { key: "location",    label: "Location" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input
                  required={required}
                  type={type ?? "text"}
                  min={type === "number" ? "0" : undefined}
                  step={type === "number" ? "any" : undefined}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 flex gap-2 justify-end mt-1">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action modal */}
      {actionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">
                {actionItem.type === "add_stock" ? "Add Stock" : actionItem.type === "issue" ? "Issue Item" : "Adjust Stock"}
              </h2>
              <button onClick={() => setActionItem(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{actionItem.name} · Current: {actionItem.stock}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
                <input type="number" min="0.01" step="any" value={actionQty} onChange={(e) => setActionQty(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Note</label>
                <input type="text" value={actionNote} onChange={(e) => setActionNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional note..." />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setActionItem(null)} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleAction} disabled={!actionQty || actionSaving}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {actionSaving && <Loader2 className="h-3 w-3 animate-spin" />} Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      {/* Error */}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Item Name", "SKU", "Unit", "Stock", "Min Level", "Status", "Location", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No items found</td></tr>
                ) : items.map((item) => {
                  const qty = Number(item.totalStock);
                  const { label, cls } = STATUS(qty, Number(item.minThreshold));
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.sku ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">{qty}</td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums">{item.minThreshold}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.location ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setActionItem({ id: item.id, name: item.name, stock: qty, type: "add_stock" })}
                            title="Add Stock" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50">
                            <ArrowDownToLine className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setActionItem({ id: item.id, name: item.name, stock: qty, type: "issue" })}
                            title="Issue" className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50">
                            <ArrowUpFromLine className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setActionItem({ id: item.id, name: item.name, stock: qty, type: "adjust" })}
                            title="Adjust" className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => startEdit(item)}
                            title="Edit" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {deleteId === item.id ? (
                            <>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                              <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteId(item.id)} title="Delete" className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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
