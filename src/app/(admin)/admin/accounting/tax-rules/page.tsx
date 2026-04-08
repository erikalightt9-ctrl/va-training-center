"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Plus, Settings, CheckCircle, XCircle } from "lucide-react";

interface TaxRule {
  id: string;
  code: string;
  name: string;
  rate: number;
  taxType: string;
  isActive: boolean;
  description: string | null;
}

const TAX_TYPE_COLORS: Record<string, string> = {
  VAT:         "bg-blue-100 text-blue-700",
  WITHHOLDING: "bg-orange-100 text-orange-700",
  INCOME:      "bg-purple-100 text-purple-700",
};

export default function TaxRulesPage() {
  const [rules, setRules]         = useState<TaxRule[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [seeding, setSeeding]     = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    code: "", name: "", rate: "", taxType: "VAT" as "VAT" | "WITHHOLDING" | "INCOME", description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/accounting/tax-rules");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRules(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      const res  = await fetch("/api/admin/accounting/tax-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_defaults" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRules(json.data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to seed");
    } finally {
      setSeeding(false);
    }
  };

  const handleCreate = async () => {
    if (!form.code || !form.name || !form.rate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/accounting/tax-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rate: parseFloat(form.rate) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false);
      setForm({ code: "", name: "", rate: "", taxType: "VAT", description: "" });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rule: TaxRule) => {
    try {
      const res = await fetch(`/api/admin/accounting/tax-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const grouped = rules.reduce<Record<string, TaxRule[]>>((acc, r) => {
    if (!acc[r.taxType]) acc[r.taxType] = [];
    acc[r.taxType].push(r);
    return acc;
  }, {});

  const GROUP_LABELS: Record<string, string> = {
    VAT:         "VAT Rules",
    WITHHOLDING: "Expanded Withholding Tax (EWT)",
    INCOME:      "Income Tax",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" />
            BIR Tax Rules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure VAT and withholding tax rates for PH compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rules.length === 0 && (
            <button
              onClick={seedDefaults}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {seeding && <Loader2 className="h-4 w-4 animate-spin" />}
              Seed PH Defaults
            </button>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add Rule
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* New Rule Form */}
      {showForm && (
        <div className="bg-white border border-emerald-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">New Tax Rule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Code (unique)</label>
              <input
                type="text"
                placeholder="e.g. VAT_12"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. VAT 12%"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="12"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tax Type</label>
              <select
                value={form.taxType}
                onChange={(e) => setForm({ ...form, taxType: e.target.value as typeof form.taxType })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="VAT">VAT</option>
                <option value="WITHHOLDING">Withholding (EWT)</option>
                <option value="INCOME">Income Tax</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Description (optional)</label>
              <input
                type="text"
                placeholder="BIR ATC or additional notes"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !form.code || !form.name || !form.rate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Rule
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <Settings className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No tax rules configured</p>
          <p className="text-sm text-slate-400 mt-1">
            Click <strong>Seed PH Defaults</strong> to load standard BIR tax rates, or add rules manually.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([taxType, groupRules]) => (
            <div key={taxType} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  {GROUP_LABELS[taxType] ?? taxType}
                </h2>
                <span className="text-xs text-slate-400">{groupRules.length} rules</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                    <th className="px-5 py-2 text-left">Code</th>
                    <th className="px-5 py-2 text-left">Name</th>
                    <th className="px-5 py-2 text-left">Description</th>
                    <th className="px-5 py-2 text-right">Rate</th>
                    <th className="px-5 py-2 text-center">Status</th>
                    <th className="px-5 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupRules.map((rule) => (
                    <tr key={rule.id} className={`hover:bg-slate-50 ${!rule.isActive ? "opacity-50" : ""}`}>
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-700">{rule.code}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{rule.name}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{rule.description ?? "—"}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TAX_TYPE_COLORS[rule.taxType] ?? "bg-slate-100 text-slate-600"}`}>
                          {Number(rule.rate)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {rule.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <CheckCircle className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <XCircle className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleActive(rule)}
                          className="text-xs text-slate-500 hover:text-slate-800 underline"
                        >
                          {rule.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
