"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, Plus, Loader2, RefreshCw, Pencil, Trash2, Check, X, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface BudgetCategory {
  id: string; name: string; description: string | null;
  monthlyBudget: number; yearlyBudget: number; color: string | null;
  budget: number; spent: number; remaining: number; utilization: number;
  entries: BudgetEntry[];
}
interface BudgetEntry {
  id: string; categoryId: string; description: string; amount: number;
  entryDate: string; reference: string | null; source: string; createdAt: string;
}
interface Summary { totalBudget: number; totalSpent: number; procurementSpend: number; fuelSpend: number; totalActual: number; }

const fmt   = (n: number) => `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const isoD  = (d: string) => new Date(d).toISOString().split("T")[0];
const fmtD  = (d: string) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];
const EMPTY_CAT   = { name: "", description: "", monthlyBudget: "", yearlyBudget: "", color: COLORS[0] };
const EMPTY_ENTRY = { categoryId: "", description: "", amount: "", entryDate: "", reference: "", source: "MANUAL" };

export default function BudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [summary, setSummary]       = useState<Summary>({ totalBudget:0, totalSpent:0, procurementSpend:0, fuelSpend:0, totalActual:0 });
  const [loading, setLoading]       = useState(true);
  const [period, setPeriod]         = useState("month");
  const [month, setMonth]           = useState(() => { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; });
  const [year, setYear]             = useState(String(new Date().getFullYear()));
  const [expanded, setExpanded]     = useState<string|null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [catForm, setCatForm]       = useState({ ...EMPTY_CAT });
  const [entryForm, setEntryForm]   = useState({ ...EMPTY_ENTRY });
  const [editCat, setEditCat]       = useState<BudgetCategory|null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<string|null>(null);
  const [deleteResource, setDeleteResource] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (period === "month") p.set("month", month); else p.set("year", year);
      const res  = await fetch(`/api/admin/office-admin/budget?${p}`);
      const json = await res.json();
      if (json.success) { setCategories(json.data.categories); setSummary(json.data.summary); }
    } finally { setLoading(false); }
  }, [period, month, year]);

  useEffect(() => { void load(); }, [load]);

  async function saveCat() {
    if (!catForm.name) return alert("Name is required.");
    setSaving(true);
    try {
      const body = { resource: "category", name: catForm.name, description: catForm.description||null, monthlyBudget: parseFloat(catForm.monthlyBudget)||0, yearlyBudget: parseFloat(catForm.yearlyBudget)||0, color: catForm.color };
      const method = editCat ? "PATCH" : "POST";
      const payload = editCat ? { ...body, id: editCat.id } : body;
      const res  = await fetch("/api/admin/office-admin/budget", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowCatForm(false); setEditCat(null); setCatForm({...EMPTY_CAT}); load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function saveEntry() {
    if (!entryForm.categoryId || !entryForm.description || !entryForm.amount || !entryForm.entryDate) return alert("All required fields must be filled.");
    setSaving(true);
    try {
      const body = { categoryId: entryForm.categoryId, description: entryForm.description, amount: parseFloat(entryForm.amount), entryDate: entryForm.entryDate, reference: entryForm.reference||null, source: entryForm.source };
      const res  = await fetch("/api/admin/office-admin/budget", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowEntryForm(false); setEntryForm({...EMPTY_ENTRY}); load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, resource: string) {
    await fetch(`/api/admin/office-admin/budget?id=${id}&resource=${resource}`, { method: "DELETE" });
    setDeleteId(null); load();
  }

  function openEditCat(c: BudgetCategory) {
    setCatForm({ name: c.name, description: c.description??"", monthlyBudget: String(c.monthlyBudget), yearlyBudget: String(c.yearlyBudget), color: c.color??COLORS[0] });
    setEditCat(c); setShowCatForm(true);
  }

  const utilColor = (u: number) => u >= 100 ? "bg-red-500" : u >= 80 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Budget</h1>
            <p className="text-xs text-slate-400">Category budgets, allocations, and spend tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{setShowEntryForm((v)=>!v); setEntryForm({...EMPTY_ENTRY});}}
            className="flex items-center gap-2 px-3 py-2 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700">
            <Plus className="h-3.5 w-3.5" /> Log Expense
          </button>
          <button onClick={()=>{setShowCatForm((v)=>!v); setEditCat(null); setCatForm({...EMPTY_CAT});}}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50">
            <Plus className="h-3.5 w-3.5" /> Add Category
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          {[["month","Monthly"],["year","Yearly"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPeriod(v)} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${period===v?"bg-slate-700 text-white":"text-slate-500 hover:text-slate-700"}`}>{l}</button>
          ))}
        </div>
        {period==="month" ? (
          <input type="month" value={month} onChange={(e)=>setMonth(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500" />
        ) : (
          <select value={year} onChange={(e)=>setYear(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500">
            {Array.from({length:5},(_,i)=>String(new Date().getFullYear()-i)).map((y)=><option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Budget",    value: fmt(summary.totalBudget),    icon: <DollarSign className="h-4 w-4 text-violet-600" />, cls: "" },
          { label: "Total Spent",     value: fmt(summary.totalActual),    icon: <TrendingUp  className="h-4 w-4 text-rose-500"   />, cls: summary.totalActual > summary.totalBudget ? "border-red-200" : "" },
          { label: "Procurement",     value: fmt(summary.procurementSpend), icon: <TrendingUp className="h-4 w-4 text-blue-500"  />, cls: "" },
          { label: "Fuel",            value: fmt(summary.fuelSpend),      icon: <TrendingDown className="h-4 w-4 text-amber-500" />, cls: "" },
        ].map((k)=>(
          <div key={k.label} className={`bg-white border rounded-xl p-4 ${k.cls||"border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1"><p className="text-xs text-slate-500">{k.label}</p>{k.icon}</div>
            <p className="text-lg font-bold text-slate-900 tabular-nums">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Category Form */}
      {showCatForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">{editCat?"Edit Category":"New Category"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input value={catForm.name} onChange={(e)=>setCatForm({...catForm,name:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Monthly Budget (₱)</label>
              <input type="number" min="0" step="0.01" value={catForm.monthlyBudget} onChange={(e)=>setCatForm({...catForm,monthlyBudget:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Yearly Budget (₱)</label>
              <input type="number" min="0" step="0.01" value={catForm.yearlyBudget} onChange={(e)=>setCatForm({...catForm,yearlyBudget:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {COLORS.map((c)=>(
                  <button key={c} onClick={()=>setCatForm({...catForm,color:c})}
                    style={{backgroundColor:c}} className={`h-6 w-6 rounded-full border-2 transition-all ${catForm.color===c?"border-slate-700 scale-110":"border-transparent"}`} />
                ))}
              </div>
            </div>
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <input value={catForm.description} onChange={(e)=>setCatForm({...catForm,description:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={()=>{setShowCatForm(false);setEditCat(null);}} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={saveCat} disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} {editCat?"Save Changes":"Add Category"}
            </button>
          </div>
        </div>
      )}

      {/* Entry Form */}
      {showEntryForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">Log Expense</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select value={entryForm.categoryId} onChange={(e)=>setEntryForm({...entryForm,categoryId:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">— Select —</option>
                {categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Amount (₱) *</label>
              <input type="number" min="0" step="0.01" value={entryForm.amount} onChange={(e)=>setEntryForm({...entryForm,amount:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
              <input type="date" value={entryForm.entryDate} onChange={(e)=>setEntryForm({...entryForm,entryDate:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
              <input value={entryForm.description} onChange={(e)=>setEntryForm({...entryForm,description:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Reference #</label>
              <input value={entryForm.reference} onChange={(e)=>setEntryForm({...entryForm,reference:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" /></div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={()=>setShowEntryForm(false)} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={saveEntry} disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} Log Expense
            </button>
          </div>
        </div>
      )}

      {/* Category Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No budget categories yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat)=>(
            <div key={cat.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {/* Category header */}
              <button onClick={()=>setExpanded(expanded===cat.id?null:cat.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                <div className="h-3 w-3 rounded-full shrink-0" style={{backgroundColor: cat.color??COLORS[0]}} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    {cat.utilization >= 100 && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    {cat.description && <span className="text-xs text-slate-400">{cat.description}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Budget: <span className="font-semibold text-slate-700">{fmt(cat.budget)}</span></span>
                    <span>Spent: <span className={`font-semibold ${cat.utilization>=100?"text-red-600":cat.utilization>=80?"text-amber-600":"text-slate-700"}`}>{fmt(cat.spent)}</span></span>
                    <span>Remaining: <span className={`font-semibold ${cat.remaining<0?"text-red-600":"text-slate-700"}`}>{fmt(cat.remaining)}</span></span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${cat.utilization>=100?"bg-red-100 text-red-700":cat.utilization>=80?"bg-amber-100 text-amber-700":"bg-green-100 text-green-700"}`}>{cat.utilization}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${utilColor(cat.utilization)}`} style={{width:`${Math.min(cat.utilization,100)}%`}} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e)=>{e.stopPropagation();openEditCat(cat);}} className="p-1.5 rounded text-blue-500 hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" /></button>
                  {deleteId===cat.id && deleteResource==="category" ? (
                    <>
                      <button onClick={(e)=>{e.stopPropagation();handleDelete(cat.id,"category");}} className="p-1.5 rounded text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={(e)=>{e.stopPropagation();setDeleteId(null);}} className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                    </>
                  ) : (
                    <button onClick={(e)=>{e.stopPropagation();setDeleteId(cat.id);setDeleteResource("category");}} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              </button>

              {/* Entries */}
              {expanded===cat.id && (
                <div className="border-t border-slate-100">
                  {cat.entries.length === 0 ? (
                    <p className="px-5 py-4 text-xs text-slate-400">No expenses logged for this category in the selected period.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          {["Date","Description","Reference","Source","Amount",""].map((h)=>(
                            <th key={h} className="px-4 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cat.entries.map((e)=>(
                          <tr key={e.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-slate-500">{fmtD(e.entryDate)}</td>
                            <td className="px-4 py-2 text-slate-700">{e.description}</td>
                            <td className="px-4 py-2 text-slate-400 font-mono">{e.reference??"—"}</td>
                            <td className="px-4 py-2"><span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-semibold">{e.source}</span></td>
                            <td className="px-4 py-2 font-semibold text-slate-800 tabular-nums">{fmt(e.amount)}</td>
                            <td className="px-4 py-2">
                              {deleteId===e.id && deleteResource==="entry" ? (
                                <div className="flex gap-1">
                                  <button onClick={()=>handleDelete(e.id,"entry")} className="p-1 rounded text-red-600 hover:bg-red-50"><Check className="h-3 w-3" /></button>
                                  <button onClick={()=>setDeleteId(null)} className="p-1 rounded text-slate-400 hover:bg-slate-100"><X className="h-3 w-3" /></button>
                                </div>
                              ) : (
                                <button onClick={()=>{setDeleteId(e.id);setDeleteResource("entry");}} className="p-1 rounded text-red-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
