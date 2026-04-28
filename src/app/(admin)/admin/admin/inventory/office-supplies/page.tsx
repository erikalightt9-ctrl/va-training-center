"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package, Plus, Search, Loader2, AlertTriangle,
  ChevronRight, TrendingDown, Edit2, Trash2, X, Check,
  ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, RefreshCw,
} from "lucide-react";

// ===== TYPES =====
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

// ===== HELPERS =====
const STATUS = (qty: number, min: number) => {
  if (qty === 0)             return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
  if (min > 0 && qty <= min) return { label: "Low Stock",    cls: "bg-amber-100 text-amber-700" };
  return                           { label: "In Stock",    cls: "bg-emerald-100 text-emerald-700" };
};

// ===== GRID COMPONENT =====
interface GridProps {
  data: Item[];
  onEdit: (id: string, value: string) => void;
  onAction: (item: Item, type: ActionType) => void;
  onDelete: (id: string) => void;
  deleteId: string | null;
  setDeleteId: (id: string | null) => void;
}

function Grid({ data, onEdit, onAction, onDelete, deleteId, setDeleteId }: GridProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
        <Package className="h-10 w-10 text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No items found. Add your first item above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Item Name", "Category", "SKU", "Stock", "Unit", "Min Level", "Location", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const qty = Number(row.totalStock);
              const { label, cls } = STATUS(qty, Number(row.minThreshold));
              return (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{row.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{row.sku ?? "—"}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={qty}
                      onChange={(e) => onEdit(row.id, e.target.value)}
                      className="border border-slate-200 rounded px-2 py-0.5 w-20 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.unit}</td>
                  <td className="px-4 py-3 text-slate-500 tabular-nums">{row.minThreshold}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{row.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onAction(row, "add_stock")} title="Add Stock"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50">
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onAction(row, "issue")} title="Issue"
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50">
                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onAction(row, "adjust")} title="Adjust"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </button>
                      {deleteId === row.id ? (
                        <>
                          <button onClick={() => onDelete(row.id)} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteId(row.id)} title="Delete"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50">
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
  );
}

// ===== WORKFLOW DRAWER =====
interface WorkflowDrawerProps {
  open: boolean;
  item: { id: string; name: string; stock: number; type: ActionType } | null;
  onClose: () => void;
  onSubmit: (qty: number, note: string) => void;
  saving: boolean;
}

function WorkflowDrawer({ open, item, onClose, onSubmit, saving }: WorkflowDrawerProps) {
  const [qty, setQty]   = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { if (open) { setQty(""); setNote(""); } }, [open]);

  if (!open || !item) return null;

  const title = item.type === "add_stock" ? "Add Stock" : item.type === "issue" ? "Issue Item" : "Adjust Stock";
  const accent = item.type === "add_stock" ? "bg-emerald-600" : item.type === "issue" ? "bg-amber-600" : "bg-slate-600";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        <div className={`${accent} px-5 py-4 text-white`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{title}</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <p className="text-xs text-white/70 mt-0.5 truncate">{item.name}</p>
          <p className="text-xs text-white/60 mt-0.5">Current stock: <span className="font-semibold text-white">{item.stock}</span></p>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
            <input
              type="number"
              min="0.01"
              step="any"
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note / Reason</label>
            <textarea
              placeholder="Optional note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="border border-slate-300 rounded-lg px-3 py-2 w-full text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 space-y-2">
          <button
            onClick={() => onSubmit(parseFloat(qty) || 0, note)}
            disabled={!qty || saving}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white ${accent} hover:opacity-90 disabled:opacity-40`}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Submit"}
          </button>
          <button onClick={onClose} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ===== LOGS PANEL =====
interface LogEntry { msg: string; time: string; }

function LogsPanel({ logs }: { logs: LogEntry[] }) {
  if (logs.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mt-2">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">Activity Log</h3>
      <ul className="space-y-1.5">
        {logs.map((log, i) => (
          <li key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-600">{log.msg}</span>
            <span className="text-slate-400 tabular-nums">{log.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function OfficeSuppliesPage() {
  const [data, setData]           = useState<Item[]>([]);
  const [kpis, setKpis]           = useState<Kpis>({ total: 0, lowStock: 0, outOfStock: 0, monthlyUsage: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm]     = useState({ name: "", sku: "", unit: "pcs", totalStock: "", minThreshold: "0", location: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError]   = useState<string | null>(null);
  const [drawerItem, setDrawerItem] = useState<{ id: string; name: string; stock: number; type: ActionType } | null>(null);
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [logs, setLogs]           = useState<LogEntry[]>([]);

  const pushLog = (msg: string) => {
    const time = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [{ msg, time }, ...prev].slice(0, 50));
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res  = await fetch(`/api/admin/inventory/items?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const items: Item[] = json.data.data ?? json.data ?? [];
      setData(items);

      const low = items.filter((i) => { const q = Number(i.totalStock), m = Number(i.minThreshold); return q > 0 && m > 0 && q <= m; }).length;
      const out = items.filter((i) => Number(i.totalStock) === 0).length;
      setKpis((k) => ({ ...k, total: items.length, lowStock: low, outOfStock: out }));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  // Inline stock edit — optimistic UI
  const handleEdit = (id: string, value: string) => {
    setData((prev) => prev.map((row) => row.id === id ? { ...row, totalStock: Number(value) } : row));
  };

  // Workflow drawer submit
  const handleDrawerSubmit = async (qty: number, note: string) => {
    if (!drawerItem) return;
    setDrawerSaving(true);
    try {
      const body = {
        itemId:   drawerItem.id,
        type:     drawerItem.type === "add_stock" ? "IN" : drawerItem.type === "issue" ? "OUT" : "ADJUST",
        quantity: drawerItem.type === "issue" ? -Math.abs(qty) : Math.abs(qty),
        note:     note || null,
      };
      const res  = await fetch("/api/admin/inventory/movements", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const label = drawerItem.type === "add_stock" ? "Added" : drawerItem.type === "issue" ? "Issued" : "Adjusted";
      pushLog(`${label} ${qty} ${drawerItem.name}${note ? ` — ${note}` : ""}`);
      setDrawerItem(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setDrawerSaving(false);
    }
  };

  // Add item
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setAddSaving(true); setAddError(null);
    try {
      const body = { name: addForm.name, sku: addForm.sku || null, unit: addForm.unit, totalStock: parseFloat(addForm.totalStock) || 0, minThreshold: parseFloat(addForm.minThreshold) || 0, location: addForm.location || null };
      const res  = await fetch("/api/admin/inventory/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      pushLog(`Added item "${addForm.name}"`);
      setShowAddForm(false);
      setAddForm({ name: "", sku: "", unit: "pcs", totalStock: "", minThreshold: "0", location: "" });
      load();
    } catch (e) { setAddError(e instanceof Error ? e.message : "Failed"); }
    finally { setAddSaving(false); }
  };

  // Delete item
  const handleDelete = async (id: string) => {
    try {
      const item = data.find((i) => i.id === id);
      const res  = await fetch(`/api/admin/inventory/items?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      if (item) pushLog(`Deleted "${item.name}"`);
      setDeleteId(null);
      load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to delete"); }
  };

  return (
    <div className="p-6 space-y-5">
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
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Items",   value: kpis.total,        icon: <Package className="h-4 w-4 text-blue-600" />,          cls: "" },
          { label: "Low Stock",     value: kpis.lowStock,     icon: <TrendingDown className="h-4 w-4 text-amber-500" />,    cls: kpis.lowStock > 0 ? "border-amber-200" : "" },
          { label: "Out of Stock",  value: kpis.outOfStock,   icon: <AlertTriangle className="h-4 w-4 text-red-500" />,     cls: kpis.outOfStock > 0 ? "border-red-200" : "" },
          { label: "Monthly Usage", value: kpis.monthlyUsage, icon: <ArrowUpFromLine className="h-4 w-4 text-slate-400" />, cls: "" },
        ].map((k) => (
          <div key={k.label} className={`bg-white border rounded-xl p-4 ${k.cls || "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">{k.label}</p>{k.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Add item form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">New Item</h2>
          {addError && <p className="text-xs text-red-600 mb-3">{addError}</p>}
          <form onSubmit={handleAdd} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: "name",         label: "Item Name *", required: true },
              { key: "sku",          label: "SKU" },
              { key: "unit",         label: "Unit" },
              { key: "totalStock",   label: "Initial Stock", type: "number" },
              { key: "minThreshold", label: "Min Level",     type: "number" },
              { key: "location",     label: "Location" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input
                  required={required}
                  type={type ?? "text"}
                  min={type === "number" ? "0" : undefined}
                  step={type === "number" ? "any" : undefined}
                  value={(addForm as Record<string, string>)[key]}
                  onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3 flex gap-2 justify-end mt-1">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={addSaving}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {addSaving && <Loader2 className="h-3 w-3 animate-spin" />} Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action bar */}
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
        <button
          onClick={() => setDrawerItem({ id: "", name: "", stock: 0, type: "issue" })}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-700"
        >
          <ArrowUpFromLine className="h-3.5 w-3.5" /> Issue Item
        </button>
        <button
          onClick={() => setDrawerItem({ id: "", name: "", stock: 0, type: "add_stock" })}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" /> Add Stock
        </button>
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : (
        <Grid
          data={data}
          onEdit={handleEdit}
          onAction={(item, type) => setDrawerItem({ id: item.id, name: item.name, stock: Number(item.totalStock), type })}
          onDelete={handleDelete}
          deleteId={deleteId}
          setDeleteId={setDeleteId}
        />
      )}

      {/* Workflow Drawer */}
      <WorkflowDrawer
        open={!!drawerItem}
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onSubmit={handleDrawerSubmit}
        saving={drawerSaving}
      />

      {/* Activity Logs */}
      <LogsPanel logs={logs} />
    </div>
  );
}
