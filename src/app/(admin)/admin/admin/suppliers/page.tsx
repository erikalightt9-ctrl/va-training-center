"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Truck, X, Pencil, Mail, Phone } from "lucide-react";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

type Supplier = { id: string; name: string; contactPerson: string | null; email: string | null; phone: string | null; address: string | null; category: string | null; status: string; notes: string | null; };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Supplier | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ name:"", contactPerson:"", email:"", phone:"", address:"", category:"", status:"ACTIVE", notes:"" });

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    const res = await fetch(`/api/admin/dept/suppliers?${p}`);
    const json = await res.json();
    if (json.success) setSuppliers(json.data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ name:"", contactPerson:"", email:"", phone:"", address:"", category:"", status:"ACTIVE", notes:"" });
    setShowForm(true); setError(null);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, contactPerson: s.contactPerson ?? "", email: s.email ?? "", phone: s.phone ?? "", address: s.address ?? "", category: s.category ?? "", status: s.status, notes: s.notes ?? "" });
    setShowForm(true); setError(null);
  };

  const handleSave = async () => {
    if (!form.name) { setError("Supplier name is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = { ...form, contactPerson: form.contactPerson || undefined, email: form.email || undefined, phone: form.phone || undefined, address: form.address || undefined, category: form.category || undefined, notes: form.notes || undefined };
      const url = editing ? `/api/admin/dept/suppliers?id=${editing.id}` : "/api/admin/dept/suppliers";
      const res = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Supplier Data</h1>
          <p className="text-sm text-slate-500">Directory of pantry, maintenance, and equipment suppliers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{editing ? "Edit Supplier" : "Add Supplier"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={LABEL}>Supplier Name *</label><input className={FIELD} value={form.name} onChange={(e) => set("name",e.target.value)} /></div>
              <div><label className={LABEL}>Contact Person</label><input className={FIELD} value={form.contactPerson} onChange={(e) => set("contactPerson",e.target.value)} /></div>
              <div><label className={LABEL}>Category</label><input className={FIELD} placeholder="Pantry, Maintenance, Equipment..." value={form.category} onChange={(e) => set("category",e.target.value)} /></div>
              <div><label className={LABEL}>Email</label><input type="email" className={FIELD} value={form.email} onChange={(e) => set("email",e.target.value)} /></div>
              <div><label className={LABEL}>Phone</label><input className={FIELD} value={form.phone} onChange={(e) => set("phone",e.target.value)} /></div>
              <div className="col-span-2"><label className={LABEL}>Address</label><textarea className={FIELD} rows={2} value={form.address} onChange={(e) => set("address",e.target.value)} /></div>
              <div>
                <label className={LABEL}>Status</label>
                <select className={FIELD} value={form.status} onChange={(e) => set("status",e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
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
      ) : suppliers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400"><Truck className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No suppliers recorded yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  {s.category && <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{s.category}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${s.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>{s.status}</span>
                  <button onClick={() => openEdit(s)} className="text-teal-600 hover:text-teal-800"><Pencil className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {s.contactPerson && <p className="text-sm text-slate-600">{s.contactPerson}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
              </div>
              {s.address && <p className="text-xs text-slate-400">{s.address}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
