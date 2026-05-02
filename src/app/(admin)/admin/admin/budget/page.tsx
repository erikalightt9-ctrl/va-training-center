"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign, Plus, Trash2, AlertTriangle, Loader2,
  X, Check, Inbox, TrendingUp, TrendingDown, Tag,
  CalendarDays, FileText, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BudgetCategory {
  id: string;
  name: string;
  color: string;
  monthlyBudget: number;
  yearlyBudget: number;
  actualSpend: number;
  budget: number;
  utilization: number;
  overBudget: boolean;
}

interface BudgetEntry {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  entryDate: string;
  reference: string | null;
  category: { id: string; name: string; color: string };
}

type TabType = "categories" | "entries";
type PeriodType = "monthly" | "yearly";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  { name: "indigo",  hex: "#6366f1", bg: "bg-indigo-500"  },
  { name: "emerald", hex: "#10b981", bg: "bg-emerald-500" },
  { name: "amber",   hex: "#f59e0b", bg: "bg-amber-500"   },
  { name: "rose",    hex: "#f43f5e", bg: "bg-rose-500"    },
  { name: "blue",    hex: "#3b82f6", bg: "bg-blue-500"    },
  { name: "violet",  hex: "#8b5cf6", bg: "bg-violet-500"  },
];

const fmt   = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDt = (d: string) => new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

// ─── Add Category Modal ───────────────────────────────────────────────────────

interface AddCategoryModalProps {
  onClose: () => void;
  onSaved: () => void;
}

function AddCategoryModal({ onClose, onSaved }: AddCategoryModalProps) {
  const [name, setName]             = useState("");
  const [monthlyBudget, setMonthly] = useState("");
  const [yearlyBudget, setYearly]   = useState("");
  const [color, setColor]           = useState(PRESET_COLORS[0].hex);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    if (!monthlyBudget || !yearlyBudget) { setError("Both budget amounts are required"); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/office-admin/budget?tab=categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          monthlyBudget: parseFloat(monthlyBudget),
          yearlyBudget: parseFloat(yearlyBudget),
          color,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create category");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Add Budget Category</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category Name *</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Office Supplies"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monthly Budget (₱) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={monthlyBudget}
                  onChange={(e) => setMonthly(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Yearly Budget (₱) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={yearlyBudget}
                  onChange={(e) => setYearly(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Color</label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`h-8 w-8 rounded-full ${c.bg} transition-transform hover:scale-110 ${color === c.hex ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Add Entry Modal ──────────────────────────────────────────────────────────

interface AddEntryModalProps {
  categories: BudgetCategory[];
  onClose: () => void;
  onSaved: () => void;
}

function AddEntryModal({ categories, onClose, onSaved }: AddEntryModalProps) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDesc]      = useState("");
  const [amount, setAmount]         = useState("");
  const [entryDate, setDate]        = useState(new Date().toISOString().slice(0, 10));
  const [reference, setRef]         = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { setError("Please select a category"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    if (!amount) { setError("Amount is required"); return; }
    if (!entryDate) { setError("Date is required"); return; }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        categoryId,
        description: description.trim(),
        amount: parseFloat(amount),
        entryDate,
      };
      if (reference.trim()) body.reference = reference.trim();
      const res = await fetch("/api/admin/office-admin/budget?tab=entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create entry");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Add Expense Entry</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
              <input
                autoFocus
                type="text"
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Office chair purchase"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount (₱) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Reference # <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. OR-2024-001"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : "Add Entry"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  cat: BudgetCategory;
  onDelete: (id: string) => void;
  deleting: string | null;
  setDeleting: (id: string | null) => void;
}

function CategoryCard({ cat, onDelete, deleting, setDeleting }: CategoryCardProps) {
  const pct    = Math.min(cat.utilization, 100);
  const isOver = cat.overBudget;

  return (
    <div className={`bg-white border rounded-xl p-5 flex flex-col gap-3 shadow-sm transition-all ${isOver ? "border-red-300" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
          <h3 className="text-sm font-semibold text-slate-800 truncate">{cat.name}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isOver && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" /> Over Budget
            </span>
          )}
          {deleting === cat.id ? (
            <>
              <button
                onClick={() => onDelete(cat.id)}
                className="p-1.5 rounded text-red-600 hover:bg-red-50"
                title="Confirm delete"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeleting(null)}
                className="p-1.5 rounded text-slate-400 hover:bg-slate-100"
                title="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setDeleting(cat.id)}
              className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Spent</span>
          <span className={`font-semibold tabular-nums ${isOver ? "text-red-600" : "text-slate-700"}`}>
            {fmt(cat.actualSpend)} / {fmt(cat.budget)}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className={`font-medium ${isOver ? "text-red-600" : pct > 80 ? "text-amber-600" : "text-emerald-600"}`}>
            {cat.utilization.toFixed(1)}% utilized
          </span>
          {!isOver && (
            <span className="text-slate-400 tabular-nums">{fmt(cat.budget - cat.actualSpend)} remaining</span>
          )}
          {isOver && (
            <span className="text-red-500 tabular-nums font-medium">{fmt(cat.actualSpend - cat.budget)} over</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  const [tab, setTab]                   = useState<TabType>("categories");
  const [period, setPeriod]             = useState<PeriodType>("monthly");
  const [categories, setCategories]     = useState<BudgetCategory[]>([]);
  const [entries, setEntries]           = useState<BudgetEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showAddCat, setShowAddCat]     = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [deletingCat, setDeletingCat]   = useState<string | null>(null);
  const [filterCat, setFilterCat]       = useState<string>("");

  // ── loaders ────────────────────────────────────────────────────────────

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/admin/office-admin/budget?tab=categories&period=${period}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load categories");
      setCategories(Array.isArray(json) ? json : (json.data ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [period]);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ tab: "entries" });
      if (filterCat) params.set("categoryId", filterCat);
      const res  = await fetch(`/api/admin/office-admin/budget?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load entries");
      setEntries(Array.isArray(json) ? json : (json.data ?? []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filterCat]);

  // Pre-load categories once so the entries filter can use them
  const ensureCategories = useCallback(async () => {
    if (categories.length > 0) return;
    try {
      const res  = await fetch("/api/admin/office-admin/budget?tab=categories&period=monthly");
      const json = await res.json();
      setCategories(Array.isArray(json) ? json : (json.data ?? []));
    } catch {
      // non-critical, ignore
    }
  }, [categories.length]);

  useEffect(() => {
    if (tab === "categories") {
      loadCategories();
    } else {
      ensureCategories();
      loadEntries();
    }
  }, [tab, loadCategories, loadEntries, ensureCategories]);

  // ── delete handlers ────────────────────────────────────────────────────

  const deleteCategory = async (id: string) => {
    try {
      const res  = await fetch(`/api/admin/office-admin/budget?tab=categories&id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete");
      setDeletingCat(null);
      loadCategories();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const res  = await fetch(`/api/admin/office-admin/budget?tab=entries&id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete");
      loadEntries();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  // ── summary stats ──────────────────────────────────────────────────────

  const totalAllocated = categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent     = categories.reduce((s, c) => s + c.actualSpend, 0);
  const totalRemaining = totalAllocated - totalSpent;

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Budget</h1>
          <p className="text-xs text-slate-500 mt-0.5">Department budgets, allocations, and spend tracking</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "categories" && (
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {(["monthly", "yearly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                    period === p ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => tab === "categories" ? loadCategories() : loadEntries()}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI strip — categories tab only */}
      {tab === "categories" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">Total Allocated</p>
              <DollarSign className="h-4 w-4 text-violet-400" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">{fmt(totalAllocated)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{period} budget</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">Total Spent</p>
              <TrendingUp className={`h-4 w-4 ${totalSpent > totalAllocated ? "text-red-500" : "text-emerald-500"}`} />
            </div>
            <p className={`text-lg sm:text-xl font-bold tabular-nums ${totalSpent > totalAllocated ? "text-red-600" : "text-slate-900"}`}>
              {fmt(totalSpent)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : "0.0"}% of budget
            </p>
          </div>
          <div className={`border rounded-xl p-4 ${totalRemaining < 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">Remaining</p>
              <TrendingDown className={`h-4 w-4 ${totalRemaining < 0 ? "text-red-500" : "text-blue-400"}`} />
            </div>
            <p className={`text-lg sm:text-xl font-bold tabular-nums ${totalRemaining < 0 ? "text-red-600" : "text-slate-900"}`}>
              {fmt(Math.abs(totalRemaining))}
            </p>
            <p className={`text-[11px] mt-0.5 ${totalRemaining < 0 ? "text-red-500 font-medium" : "text-slate-400"}`}>
              {totalRemaining < 0 ? "Over budget" : "Available"}
            </p>
          </div>
        </div>
      )}

      {/* Tab bar + action button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
          {([
            { key: "categories" as const, label: "Categories", icon: Tag },
            { key: "entries"    as const, label: "Entries",    icon: FileText },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === key ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {tab === "categories" ? (
          <button
            onClick={() => setShowAddCat(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Category
          </button>
        ) : (
          <button
            onClick={() => setShowAddEntry(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Entry
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
        </div>
      )}

      {/* ── Categories View ── */}
      {!loading && tab === "categories" && (
        <>
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Inbox className="h-12 w-12 opacity-25" />
              <p className="text-sm">No budget categories yet.</p>
              <button
                onClick={() => setShowAddCat(true)}
                className="text-xs text-violet-600 hover:underline font-medium"
              >
                Add your first category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  onDelete={deleteCategory}
                  deleting={deletingCat}
                  setDeleting={setDeletingCat}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Entries View ── */}
      {!loading && tab === "entries" && (
        <div className="space-y-3">

          {/* Category filter chips */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              <button
                onClick={() => setFilterCat("")}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  !filterCat ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCat(filterCat === c.id ? "" : c.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-colors ${
                    filterCat === c.id
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Inbox className="h-12 w-12 opacity-25" />
              <p className="text-sm">No expense entries found.</p>
              <button
                onClick={() => setShowAddEntry(true)}
                className="text-xs text-violet-600 hover:underline font-medium"
              >
                Add the first entry
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Description</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                        <th className="text-right px-4 py-3 font-semibold text-slate-600">Amount</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Reference</th>
                        <th className="px-4 py-3 w-12" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-800 font-medium max-w-xs truncate">
                            {entry.description}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
                              style={{ backgroundColor: entry.category.color }}
                            >
                              {entry.category.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">
                            {fmt(entry.amount)}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="h-3 w-3 shrink-0 text-slate-400" />
                              {fmtDt(entry.entryDate)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {entry.reference ?? <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile stacked cards */}
              <div className="sm:hidden space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{entry.description}</p>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white"
                        style={{ backgroundColor: entry.category.color }}
                      >
                        {entry.category.name}
                      </span>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">{fmt(entry.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {fmtDt(entry.entryDate)}
                      </span>
                      {entry.reference && <span>{entry.reference}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddCat && (
        <AddCategoryModal
          onClose={() => setShowAddCat(false)}
          onSaved={loadCategories}
        />
      )}
      {showAddEntry && (
        <AddEntryModal
          categories={categories}
          onClose={() => setShowAddEntry(false)}
          onSaved={loadEntries}
        />
      )}
    </div>
  );
}
