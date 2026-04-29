"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Archive, X, AlertTriangle, Trash2, Clock, RefreshCw } from "lucide-react";
import { GenericBulkGrid, BulkColDef } from "@/components/admin/office-admin/GenericBulkGrid";
import { HistoryPanel } from "@/components/admin/office-admin/HistoryPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type Asset = {
  id: string; name: string; assetTag: string | null; assetType: string; status: string;
  location: string | null; purchaseDate: string | null; purchaseValue: number | null;
  warrantyExpiry: string | null; serialNumber: string | null; notes: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS    = ["FURNITURE", "APPLIANCE", "MACHINE", "EQUIPMENT", "VEHICLE", "OTHER"];
const STATUS_OPTIONS  = ["ACTIVE", "FOR_REPAIR", "IN_REPAIR", "FOR_DISPOSE", "DISPOSED", "UNDER_WARRANTY"];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:         "bg-green-50 text-green-700 border border-green-200",
  FOR_REPAIR:     "bg-amber-50 text-amber-700 border border-amber-200",
  IN_REPAIR:      "bg-orange-50 text-orange-700 border border-orange-200",
  FOR_DISPOSE:    "bg-red-50 text-red-700 border border-red-200",
  DISPOSED:       "bg-slate-100 text-slate-500 border border-slate-200",
  UNDER_WARRANTY: "bg-blue-50 text-blue-700 border border-blue-200",
};

const TYPE_COLORS: Record<string, string> = {
  FURNITURE: "bg-amber-50 text-amber-700",  APPLIANCE: "bg-purple-50 text-purple-700",
  MACHINE:   "bg-cyan-50 text-cyan-700",    EQUIPMENT: "bg-teal-50 text-teal-700",
  VEHICLE:   "bg-blue-50 text-blue-700",    OTHER:     "bg-slate-100 text-slate-600",
};

const BULK_COLS: BulkColDef[] = [
  { key: "name",          label: "Name",          required: true,  type: "text",   width: "min-w-[200px]" },
  { key: "assetTag",      label: "Tag",           required: false, type: "text",   width: "min-w-[90px]",  placeholder: "AST-001" },
  { key: "serialNumber",  label: "Serial #",      required: false, type: "text",   width: "min-w-[110px]" },
  {
    key: "assetType", label: "Type", required: false, type: "select", width: "min-w-[110px]", default: "EQUIPMENT",
    options: TYPE_OPTIONS.map((t) => ({ value: t, label: fmt(t) })),
  },
  {
    key: "status", label: "Status", required: false, type: "select", width: "min-w-[130px]", default: "ACTIVE",
    options: STATUS_OPTIONS.map((s) => ({ value: s, label: fmt(s) })),
  },
  { key: "location",      label: "Location",      required: false, type: "text",   width: "min-w-[130px]" },
  { key: "purchaseDate",  label: "Purchase Date", required: false, type: "date",   width: "min-w-[130px]" },
  { key: "purchaseValue", label: "Value (₱)",     required: false, type: "number", width: "min-w-[100px]" },
  { key: "warrantyExpiry",label: "Warranty Exp",  required: false, type: "date",   width: "min-w-[130px]" },
];

function fmt(s: string) { return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [assets, setAssets]         = useState<Asset[]>([]);
  const [stats, setStats]           = useState({ total: 0, forRepair: 0, forDispose: 0, underWarranty: 0 });
  const [loading, setLoading]       = useState(true);
  const [typeFilter, setTypeFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bulkMode, setBulkMode]     = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<Asset | null>(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState({
    name: "", assetTag: "", assetType: "FURNITURE", status: "ACTIVE",
    location: "", purchaseDate: "", purchaseValue: "", warrantyExpiry: "", serialNumber: "", notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (typeFilter)   p.set("type",   typeFilter);
      if (statusFilter) p.set("status", statusFilter);
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/dept/assets?${p}`).then((r) => r.json()),
        fetch("/api/admin/dept/assets?stats=1").then((r) => r.json()),
      ]);
      if (itemsRes.success) setAssets(itemsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openEdit = (a: Asset) => {
    setEditing(a);
    setForm({ name: a.name, assetTag: a.assetTag ?? "", assetType: a.assetType, status: a.status, location: a.location ?? "", purchaseDate: a.purchaseDate?.split("T")[0] ?? "", purchaseValue: a.purchaseValue?.toString() ?? "", warrantyExpiry: a.warrantyExpiry?.split("T")[0] ?? "", serialNumber: a.serialNumber ?? "", notes: a.notes ?? "" });
    setShowForm(true); setError(null);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", assetTag: "", assetType: "FURNITURE", status: "ACTIVE", location: "", purchaseDate: "", purchaseValue: "", warrantyExpiry: "", serialNumber: "", notes: "" });
    setShowForm(true); setError(null);
  };

  const handleSave = async () => {
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = { ...form, purchaseValue: form.purchaseValue ? parseFloat(form.purchaseValue) : undefined, purchaseDate: form.purchaseDate || undefined, warrantyExpiry: form.warrantyExpiry || undefined, assetTag: form.assetTag || undefined, location: form.location || undefined, serialNumber: form.serialNumber || undefined, notes: form.notes || undefined };
      const res = await fetch(`/api/admin/dept/assets${editing ? `?id=${editing.id}` : ""}`, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/dept/assets?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      load();
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkSave = async (rows: Record<string, string>[]) => {
    for (const row of rows) {
      await fetch("/api/admin/dept/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           row.name,
          assetTag:       row.assetTag || undefined,
          serialNumber:   row.serialNumber || undefined,
          assetType:      row.assetType || "EQUIPMENT",
          status:         row.status || "ACTIVE",
          location:       row.location || undefined,
          purchaseDate:   row.purchaseDate || undefined,
          purchaseValue:  row.purchaseValue ? parseFloat(row.purchaseValue) : undefined,
          warrantyExpiry: row.warrantyExpiry || undefined,
        }),
      });
    }
    load();
  };

  return (
    <div className="p-6 max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assets</h1>
          <p className="text-sm text-slate-500">Furniture, appliances, machines — track status and warranty</p>
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
          <button onClick={openNew} className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
            <Plus className="h-4 w-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Assets",     value: stats.total,        color: "text-slate-700" },
          { label: "For Repair",       value: stats.forRepair,    color: "text-amber-600" },
          { label: "For Dispose",      value: stats.forDispose,   color: "text-red-600" },
          { label: "Under Warranty",   value: stats.underWarranty,color: "text-blue-600" },
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
          title="Bulk Add Assets"
        />
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{fmt(t)}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{fmt(s)}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{editing ? "Edit Asset" : "Add Asset"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={LABEL}>Name *</label><input className={FIELD} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div><label className={LABEL}>Asset Tag</label><input className={FIELD} placeholder="e.g. AST-001" value={form.assetTag} onChange={(e) => set("assetTag", e.target.value)} /></div>
              <div><label className={LABEL}>Serial Number</label><input className={FIELD} value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} /></div>
              <div>
                <label className={LABEL}>Type</label>
                <select className={FIELD} value={form.assetType} onChange={(e) => set("assetType", e.target.value)}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{fmt(t)}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Status</label>
                <select className={FIELD} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{fmt(s)}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className={LABEL}>Location</label><input className={FIELD} placeholder="Room / floor / area" value={form.location} onChange={(e) => set("location", e.target.value)} /></div>
              <div><label className={LABEL}>Purchase Date</label><input type="date" className={FIELD} value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} /></div>
              <div><label className={LABEL}>Purchase Value (₱)</label><input type="number" min="0" className={FIELD} value={form.purchaseValue} onChange={(e) => set("purchaseValue", e.target.value)} /></div>
              <div><label className={LABEL}>Warranty Expiry</label><input type="date" className={FIELD} value={form.warrantyExpiry} onChange={(e) => set("warrantyExpiry", e.target.value)} /></div>
            </div>
            <div><label className={LABEL}>Notes</label><textarea className={FIELD} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
      ) : assets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <Archive className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No assets recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Name / Tag", "Type", "Status", "Location", "Purchase Date", "Warranty Expiry", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{a.name}</p>
                    {a.assetTag && <p className="text-xs text-slate-400">{a.assetTag}</p>}
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[a.assetType] ?? "bg-slate-100 text-slate-600"}`}>{fmt(a.assetType)}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] ?? ""}`}>
                      {fmt(a.status)}
                    </span>
                    {(a.status === "FOR_REPAIR" || a.status === "IN_REPAIR") && <AlertTriangle className="h-3 w-3 text-amber-500 inline ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.location ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.warrantyExpiry ? (
                      <span className={new Date(a.warrantyExpiry) < new Date() ? "text-red-500" : ""}>
                        {new Date(a.warrantyExpiry).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(a)} className="px-2 py-1 text-xs text-teal-600 hover:bg-teal-50 rounded">Edit</button>
                      <button onClick={() => setHistoryAsset(a)} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="History">
                        <Clock className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id} className="p-1 text-red-400 hover:bg-red-50 rounded" title="Delete">
                        {deleting === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">{assets.length} asset{assets.length !== 1 ? "s" : ""}</div>
        </div>
      )}

      {historyAsset && (
        <HistoryPanel
          targetId={historyAsset.id}
          targetType="asset"
          title={`History — ${historyAsset.name}`}
          onClose={() => setHistoryAsset(null)}
        />
      )}
    </div>
  );
}
