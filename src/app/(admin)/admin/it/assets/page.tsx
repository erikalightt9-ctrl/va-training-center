"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Monitor, Plus, Loader2, Search, AlertCircle,
  Package, UserCheck, Wrench, Trash2, Archive,
  ChevronRight, X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Asset {
  id: string;
  assetTag: string;
  assetName: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: string;
  condition: string;
  location: string | null;
  warrantyEnd: string | null;
  purchaseCost: number | null;
  category: { name: string } | null;
  assignedTo: { firstName: string; lastName: string; position: string } | null;
}

interface Stats {
  total: number;
  available: number;
  assigned: number;
  inRepair: number;
  forDisposal: number;
  retired: number;
}

interface Category {
  id: string;
  name: string;
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  AVAILABLE:    { label: "Available",    bg: "bg-green-100",  text: "text-green-700",  icon: <Package     className="h-3.5 w-3.5" /> },
  ASSIGNED:     { label: "Assigned",     bg: "bg-blue-100",   text: "text-blue-700",   icon: <UserCheck   className="h-3.5 w-3.5" /> },
  IN_REPAIR:    { label: "In Repair",    bg: "bg-amber-100",  text: "text-amber-700",  icon: <Wrench      className="h-3.5 w-3.5" /> },
  FOR_DISPOSAL: { label: "For Disposal", bg: "bg-red-100",    text: "text-red-600",    icon: <Trash2      className="h-3.5 w-3.5" /> },
  RETIRED:      { label: "Retired",      bg: "bg-slate-100",  text: "text-slate-500",  icon: <Archive     className="h-3.5 w-3.5" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-slate-100", text: "text-slate-500", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

const CONDITION_STYLES: Record<string, string> = {
  NEW:  "bg-emerald-50 text-emerald-700",
  GOOD: "bg-green-50 text-green-700",
  FAIR: "bg-yellow-50 text-yellow-700",
  POOR: "bg-red-50 text-red-600",
};

/* ------------------------------------------------------------------ */
/*  Add Asset Modal                                                     */
/* ------------------------------------------------------------------ */

function AddAssetModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [assetName, setAssetName]       = useState("");
  const [categoryId, setCategoryId]     = useState("");
  const [brand, setBrand]               = useState("");
  const [model, setModel]               = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [supplier, setSupplier]         = useState("");
  const [warrantyEnd, setWarrantyEnd]   = useState("");
  const [condition, setCondition]       = useState<"NEW" | "GOOD" | "FAIR" | "POOR">("NEW");
  const [location, setLocation]         = useState("");
  const [notes, setNotes]               = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assetName.trim()) { setError("Asset name is required."); return; }
    setSaving(true); setError(null);
    try {
      const body: Record<string, unknown> = { assetName: assetName.trim(), condition };
      if (categoryId)    body.categoryId    = categoryId;
      if (brand)         body.brand         = brand;
      if (model)         body.model         = model;
      if (serialNumber)  body.serialNumber  = serialNumber;
      if (purchaseDate)  body.purchaseDate  = purchaseDate;
      if (purchaseCost)  body.purchaseCost  = parseFloat(purchaseCost);
      if (supplier)      body.supplier      = supplier;
      if (warrantyEnd)   body.warrantyEnd   = warrantyEnd;
      if (location)      body.location      = location;
      if (notes)         body.notes         = notes;

      const res  = await fetch("/api/admin/it/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create asset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Add New Asset</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {/* Row 1 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name <span className="text-red-500">*</span></label>
            <input value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="e.g. MacBook Pro 16-inch"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="NEW">New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Apple"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. A2141"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
            <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g. C02ZM1XXMD6R"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Cost (₱)</label>
              <input type="number" step="0.01" min="0" value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} placeholder="0.00"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
              <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. PC Express"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warranty End</label>
              <input type="date" value={warrantyEnd} onChange={(e) => setWarrantyEnd(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Office, Branch 2, Remote"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes…"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
          <button onClick={(e) => { e.preventDefault(); const form = (e.target as HTMLElement).closest('.flex')?.previousElementSibling as HTMLFormElement; form?.requestSubmit(); }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Plus className="h-4 w-4" />Add Asset</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ItAssetsPage() {
  const [assets, setAssets]         = useState<Asset[]>([]);
  const [stats, setStats]           = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search)       params.set("search", search);
      params.set("limit", "100");

      const [assetsRes, statsRes, catsRes] = await Promise.all([
        fetch(`/api/admin/it/assets?${params}`),
        fetch("/api/admin/it/assets?stats=1"),
        fetch("/api/admin/it/categories"),
      ]);
      const [assetsJson, statsJson, catsJson] = await Promise.all([
        assetsRes.json(), statsRes.json(), catsRes.json(),
      ]);

      if (assetsJson.success) { setAssets(assetsJson.data.data); setTotal(assetsJson.data.total); }
      if (statsJson.success)  setStats(statsJson.data);
      if (catsJson.success)   setCategories(catsJson.data);
    } catch { /* non-fatal */ } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const peso = (n: number | null) =>
    n != null ? `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "—";

  const warrantyStatus = (end: string | null) => {
    if (!end) return null;
    const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
    if (diff < 0)  return <span className="text-red-500 text-xs">Expired</span>;
    if (diff < 30) return <span className="text-amber-500 text-xs">Expiring ({diff}d)</span>;
    return <span className="text-green-600 text-xs">Active</span>;
  };

  return (
    <>
      {showAdd && (
        <AddAssetModal categories={categories} onClose={() => setShowAdd(false)} onCreated={load} />
      )}

      <div className="p-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Monitor className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">IT Assets</h1>
              <p className="text-sm text-slate-500">Manage and track all IT equipment</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />Add Asset
          </button>
        </div>

        {/* ── Stats cards ── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {([
              { label: "Total",        value: stats.total,       icon: <Package className="h-5 w-5 text-slate-400" />,  accent: "text-slate-900" },
              { label: "Available",    value: stats.available,   icon: <Package className="h-5 w-5 text-green-500" />,  accent: "text-green-700" },
              { label: "Assigned",     value: stats.assigned,    icon: <UserCheck className="h-5 w-5 text-blue-500" />, accent: "text-blue-700" },
              { label: "In Repair",    value: stats.inRepair,    icon: <Wrench className="h-5 w-5 text-amber-500" />,   accent: "text-amber-700" },
              { label: "For Disposal", value: stats.forDisposal, icon: <Trash2 className="h-5 w-5 text-red-400" />,     accent: "text-red-600" },
              { label: "Retired",      value: stats.retired,     icon: <Archive className="h-5 w-5 text-slate-400" />,  accent: "text-slate-500" },
            ] as const).map((c) => (
              <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">{c.icon}<span className="text-xs text-slate-500">{c.label}</span></div>
                <p className={`text-2xl font-bold ${c.accent}`}>{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tag, brand, serial…"
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_REPAIR">In Repair</option>
            <option value="FOR_DISPOSAL">For Disposal</option>
            <option value="RETIRED">Retired</option>
          </select>
          <p className="text-xs text-slate-400 ml-auto">{total} asset{total !== 1 ? "s" : ""}</p>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Monitor className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">No assets found</p>
            <p className="text-sm text-slate-400 mt-1">
              {search || statusFilter ? "Try changing your filters" : "Add your first IT asset to get started"}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left">Asset</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Condition</th>
                  <th className="px-5 py-3 text-left">Assigned To</th>
                  <th className="px-5 py-3 text-left">Warranty</th>
                  <th className="px-5 py-3 text-right">Cost</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{a.assetName}</p>
                      <p className="text-xs text-slate-400">
                        {a.assetTag}
                        {a.brand && ` · ${a.brand}`}
                        {a.model && ` ${a.model}`}
                      </p>
                      {a.serialNumber && <p className="text-xs text-slate-400 font-mono">{a.serialNumber}</p>}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{a.category?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-center"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_STYLES[a.condition] ?? "bg-slate-100 text-slate-500"}`}>
                        {a.condition}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {a.assignedTo
                        ? <span className="text-slate-700 text-xs">{a.assignedTo.firstName} {a.assignedTo.lastName}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3">{warrantyStatus(a.warrantyEnd)}</td>
                    <td className="px-5 py-3 text-right text-slate-600 font-mono text-xs">{peso(a.purchaseCost)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/it/assets/${a.id}`} className="text-indigo-600 hover:text-indigo-800">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
