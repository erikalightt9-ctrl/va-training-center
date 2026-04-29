"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Building2, X, Trash2, Clock, RefreshCw, Search, Mail, Phone } from "lucide-react";
import { HistoryPanel } from "@/components/admin/office-admin/HistoryPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  id:            string;
  name:          string;
  contactPerson: string | null;
  email:         string | null;
  phone:         string | null;
  address:       string | null;
  category:      string | null;
  status:        "ACTIVE" | "INACTIVE";
  notes:         string | null;
  createdAt:     string;
  updatedAt:     string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

// ─── Component ────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const [vendors, setVendors]         = useState<Vendor[]>([]);
  const [stats, setStats]             = useState({ active: 0 });
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ]                     = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<Vendor | null>(null);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [historyVendor, setHistoryVendor] = useState<Vendor | null>(null);

  const [form, setFormState] = useState({
    name: "", contactPerson: "", email: "", phone: "",
    address: "", category: "", status: "ACTIVE" as "ACTIVE" | "INACTIVE", notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusFilter) p.set("status", statusFilter);
      const [itemsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/dept/suppliers?${p}`).then((r) => r.json()),
        fetch("/api/admin/dept/suppliers?stats=1").then((r) => r.json()),
      ]);
      if (itemsRes.success) setVendors(itemsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setFormState((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setFormState({ name: "", contactPerson: "", email: "", phone: "", address: "", category: "", status: "ACTIVE", notes: "" });
    setError(null); setShowForm(true);
  };

  const openEdit = (v: Vendor) => {
    setEditing(v);
    setFormState({ name: v.name, contactPerson: v.contactPerson ?? "", email: v.email ?? "", phone: v.phone ?? "", address: v.address ?? "", category: v.category ?? "", status: v.status, notes: v.notes ?? "" });
    setError(null); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = {
        name:          form.name.trim(),
        contactPerson: form.contactPerson.trim() || undefined,
        email:         form.email.trim() || undefined,
        phone:         form.phone.trim() || undefined,
        address:       form.address.trim() || undefined,
        category:      form.category.trim() || undefined,
        status:        form.status,
        notes:         form.notes.trim() || undefined,
      };
      const url = editing ? `/api/admin/dept/suppliers?id=${editing.id}` : "/api/admin/dept/suppliers";
      const res = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/dept/suppliers?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      load();
    } finally { setDeleting(null); }
  };

  const filtered = q.trim()
    ? vendors.filter((v) =>
        v.name.toLowerCase().includes(q.toLowerCase()) ||
        v.category?.toLowerCase().includes(q.toLowerCase()) ||
        v.contactPerson?.toLowerCase().includes(q.toLowerCase())
      )
    : vendors;

  return (
    <div className="p-6 max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" /> Vendors
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Vendor directory, contacts, and performance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
            <Plus className="h-4 w-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Vendors</p>
          <p className="text-2xl font-bold mt-1 text-slate-700">{vendors.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Active</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.active}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Inactive</p>
          <p className="text-2xl font-bold mt-1 text-slate-400">{vendors.length - stats.active}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vendors..."
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 w-56"
          />
        </div>
        <div className="flex gap-1">
          {["", "ACTIVE", "INACTIVE"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium ${statusFilter === s ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400">No vendors found</p>
          <button onClick={openNew} className="mt-3 text-xs text-teal-600 hover:underline">Add first vendor</button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Vendor", "Category", "Contact", "Email / Phone", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{v.name}</p>
                    {v.address && <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{v.address}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {v.category ? (
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{v.category}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.contactPerson ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {v.email && <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" />{v.email}</div>}
                      {v.phone && <div className="flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3 w-3" />{v.phone}</div>}
                      {!v.email && !v.phone && <span className="text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                      {v.status[0] + v.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(v)} className="px-2 py-1 text-xs text-teal-600 hover:bg-teal-50 rounded">Edit</button>
                      <button onClick={() => setHistoryVendor(v)} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="History">
                        <Clock className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id} className="p-1 text-red-400 hover:bg-red-50 rounded" title="Delete">
                        {deleting === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">{editing ? "Edit Vendor" : "Add Vendor"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={LABEL}>Vendor Name *</label><input className={FIELD} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
                <div><label className={LABEL}>Contact Person</label><input className={FIELD} value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} /></div>
                <div><label className={LABEL}>Category</label><input className={FIELD} placeholder="e.g. Office Supplies" value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
                <div><label className={LABEL}>Email</label><input type="email" className={FIELD} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                <div><label className={LABEL}>Phone</label><input className={FIELD} value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
                <div className="col-span-2"><label className={LABEL}>Address</label><input className={FIELD} value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
                <div>
                  <label className={LABEL}>Status</label>
                  <select className={FIELD} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="col-span-2"><label className={LABEL}>Notes</label><textarea className={FIELD} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {historyVendor && (
        <HistoryPanel
          targetId={historyVendor.id}
          targetType="vendor"
          title={`History — ${historyVendor.name}`}
          onClose={() => setHistoryVendor(null)}
        />
      )}
    </div>
  );
}
