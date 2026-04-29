"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, ShoppingCart, X, Trash2, Clock, Search, RefreshCw } from "lucide-react";
import { GenericBulkGrid, BulkColDef } from "@/components/admin/office-admin/GenericBulkGrid";
import { HistoryPanel } from "@/components/admin/office-admin/HistoryPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProcStatus = "PENDING" | "ORDERED" | "DELIVERED" | "CANCELLED";

interface ProcurementItem {
  id:           string;
  itemName:     string;
  vendorName:   string | null;
  quantity:     number;
  unit:         string;
  unitPrice:    number | null;
  poNumber:     string | null;
  deliveryDate: string | null;
  status:       ProcStatus;
  notes:        string | null;
  createdBy:    string | null;
  updatedBy:    string | null;
  createdAt:    string;
  updatedAt:    string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES: ProcStatus[] = ["PENDING", "ORDERED", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<ProcStatus, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border border-amber-200",
  ORDERED:   "bg-blue-50 text-blue-700 border border-blue-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-500 border border-slate-200",
};

const BULK_COLS: BulkColDef[] = [
  { key: "itemName",     label: "Item Name",   required: true,  type: "text",   width: "min-w-[200px]", placeholder: "e.g. Bond Paper A4" },
  { key: "vendorName",   label: "Vendor",      required: false, type: "text",   width: "min-w-[150px]", placeholder: "Supplier name" },
  { key: "quantity",     label: "Qty",         required: false, type: "number", width: "min-w-[80px]",  default: "1" },
  { key: "unit",         label: "Unit",        required: false, type: "text",   width: "min-w-[80px]",  default: "pcs" },
  { key: "unitPrice",    label: "Unit Price",  required: false, type: "number", width: "min-w-[100px]" },
  { key: "poNumber",     label: "PO #",        required: false, type: "text",   width: "min-w-[100px]" },
  { key: "deliveryDate", label: "Delivery",    required: false, type: "date",   width: "min-w-[130px]" },
  {
    key: "status", label: "Status", required: false, type: "select", width: "min-w-[110px]",
    default: "PENDING",
    options: STATUSES.map((s) => ({ value: s, label: s[0] + s.slice(1).toLowerCase() })),
  },
];

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";
const LABEL = "block text-xs text-slate-500 mb-1";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProcurementPage() {
  const [items, setItems]       = useState<ProcurementItem[]>([]);
  const [stats, setStats]       = useState({ total: 0, pending: 0, ordered: 0, delivered: 0 });
  const [loading, setLoading]   = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [q, setQ]               = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<ProcurementItem | null>(null);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [historyItem, setHistoryItem] = useState<ProcurementItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    itemName: "", vendorName: "", quantity: "1", unit: "pcs",
    unitPrice: "", poNumber: "", deliveryDate: "", status: "PENDING" as ProcStatus, notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusFilter) p.set("status", statusFilter);
      if (q.trim())     p.set("q", q.trim());

      const [itemsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/office-admin/procurement?${p}`).then((r) => r.json()),
        fetch("/api/admin/office-admin/procurement?stats=1").then((r) => r.json()),
      ]);
      if (itemsRes.success) setItems(itemsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ itemName: "", vendorName: "", quantity: "1", unit: "pcs", unitPrice: "", poNumber: "", deliveryDate: "", status: "PENDING", notes: "" });
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (item: ProcurementItem) => {
    setEditing(item);
    setForm({
      itemName:     item.itemName,
      vendorName:   item.vendorName ?? "",
      quantity:     String(item.quantity),
      unit:         item.unit,
      unitPrice:    item.unitPrice != null ? String(item.unitPrice) : "",
      poNumber:     item.poNumber ?? "",
      deliveryDate: item.deliveryDate ? item.deliveryDate.split("T")[0] : "",
      status:       item.status,
      notes:        item.notes ?? "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.itemName.trim()) { setFormError("Item name is required."); return; }
    setSaving(true); setFormError(null);
    try {
      const body = {
        itemName:     form.itemName.trim(),
        vendorName:   form.vendorName.trim() || null,
        quantity:     parseFloat(form.quantity) || 0,
        unit:         form.unit.trim() || "pcs",
        unitPrice:    form.unitPrice ? parseFloat(form.unitPrice) : null,
        poNumber:     form.poNumber.trim() || null,
        deliveryDate: form.deliveryDate || null,
        status:       form.status,
        notes:        form.notes.trim() || null,
      };
      const url = editing ? `/api/admin/office-admin/procurement?id=${editing.id}` : "/api/admin/office-admin/procurement";
      const res = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false);
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this procurement item?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/office-admin/procurement?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      load();
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkSave = async (rows: Record<string, string>[]) => {
    const res = await fetch("/api/admin/office-admin/procurement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: rows.map((r) => ({
          itemName:     r.itemName,
          vendorName:   r.vendorName || undefined,
          quantity:     parseFloat(r.quantity) || 0,
          unit:         r.unit || "pcs",
          unitPrice:    r.unitPrice ? parseFloat(r.unitPrice) : undefined,
          poNumber:     r.poNumber || undefined,
          deliveryDate: r.deliveryDate || undefined,
          status:       (r.status as ProcStatus) || "PENDING",
          notes:        r.notes || undefined,
        })),
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    load();
  };

  const fmt = (n: number) => n.toLocaleString("en-PH", { minimumFractionDigits: 2 });

  return (
    <div className="p-6 max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" /> Procurement
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Purchase orders, requisitions, and supplier sourcing</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setBulkMode((p) => !p)}
            className={`px-3 py-2 text-sm rounded-lg border font-medium ${bulkMode ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            Bulk Add
          </button>
          <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total,     color: "text-slate-700" },
          { label: "Pending",   value: stats.pending,   color: "text-amber-600" },
          { label: "Ordered",   value: stats.ordered,   color: "text-blue-600" },
          { label: "Delivered", value: stats.delivered, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Grid */}
      {bulkMode && (
        <GenericBulkGrid
          columns={BULK_COLS}
          onSave={handleBulkSave}
          onCancel={() => setBulkMode(false)}
          title="Bulk Add Procurement Items"
        />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items, vendors, PO#..."
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 w-64"
          />
        </div>
        <div className="flex gap-1">
          {(["", ...STATUSES] as string[]).map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium ${statusFilter === s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400">No procurement items found</p>
          <button onClick={openNew} className="mt-3 text-xs text-emerald-600 hover:underline">Add first item</button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Item", "Vendor", "Qty", "Unit Price", "Total", "PO #", "Delivery", "Status", "Modified by", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const total = item.unitPrice != null ? item.unitPrice * item.quantity : null;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 group">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{item.itemName}</p>
                        {item.notes && <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.notes}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.vendorName ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-700 tabular-nums">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-slate-600 tabular-nums">{item.unitPrice != null ? `₱${fmt(item.unitPrice)}` : "—"}</td>
                      <td className="px-4 py-3 text-slate-700 tabular-nums font-medium">{total != null ? `₱${fmt(total)}` : "—"}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.poNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status]}`}>
                          {item.status[0] + item.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {item.updatedBy ?? item.createdBy ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(item)}
                            className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                          >Edit</button>
                          <button
                            onClick={() => setHistoryItem(item)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="History"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="p-1 text-red-400 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            {deleting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">{editing ? "Edit Procurement Item" : "Add Procurement Item"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{formError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={LABEL}>Item Name *</label>
                  <input className={FIELD} value={form.itemName} onChange={(e) => set("itemName", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Vendor / Supplier</label>
                  <input className={FIELD} value={form.vendorName} onChange={(e) => set("vendorName", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Quantity</label>
                  <input type="number" min="0" className={FIELD} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Unit</label>
                  <input className={FIELD} placeholder="pcs / box / ream" value={form.unit} onChange={(e) => set("unit", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Unit Price (₱)</label>
                  <input type="number" min="0" className={FIELD} value={form.unitPrice} onChange={(e) => set("unitPrice", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>PO Number</label>
                  <input className={FIELD} placeholder="PO-2026-001" value={form.poNumber} onChange={(e) => set("poNumber", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Delivery Date</label>
                  <input type="date" className={FIELD} value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Status</label>
                  <select className={FIELD} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s[0] + s.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Notes</label>
                  <textarea className={FIELD} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {historyItem && (
        <HistoryPanel
          targetId={historyItem.id}
          targetType="procurement"
          title={`History — ${historyItem.itemName}`}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}
