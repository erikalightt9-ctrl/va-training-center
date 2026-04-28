"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Fuel, Wrench, Plus, Search, Loader2,
  ChevronRight, RefreshCw, Trash2, X, Check, Car,
  Gauge, DollarSign, Droplets, Filter,
} from "lucide-react";

interface FuelLog {
  id: string;
  vehicleInfo: string;
  date: string;
  liters: number;
  pricePerLiter: number | null;
  totalCost: number | null;
  odometer: number | null;
  driver: string | null;
  station: string | null;
}

interface MaintLog {
  id: string;
  vehicleInfo: string;
  date: string;
  maintenanceType: string;
  description: string | null;
  cost: number | null;
  odometer: number | null;
  shop: string | null;
  nextServiceDate: string | null;
}

interface Kpis {
  totalVehicles: number;
  totalFuelLogs: number;
  totalMaintLogs: number;
  totalLiters: number;
  totalFuelCost: number;
  totalMaintCost: number;
}

const fmt = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

const EMPTY_FUEL = { vehicleInfo: "", date: "", liters: "", pricePerLiter: "", totalCost: "", odometer: "", driver: "", station: "" };
const EMPTY_MAINT = { vehicleInfo: "", date: "", maintenanceType: "", description: "", cost: "", odometer: "", shop: "", nextServiceDate: "" };

export default function FuelMaintenancePage() {
  const [tab, setTab]           = useState<"fuel" | "maintenance">("fuel");
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintLog[]>([]);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [kpis, setKpis]         = useState<Kpis>({ totalVehicles: 0, totalFuelLogs: 0, totalMaintLogs: 0, totalLiters: 0, totalFuelCost: 0, totalMaintCost: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filterVehicle, setFilterVehicle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({ ...EMPTY_FUEL });
  const [maintForm, setMaintForm] = useState({ ...EMPTY_MAINT });
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (filterVehicle) params.set("vehicle", filterVehicle);
      const res  = await fetch(`/api/admin/office-admin/fuel-maintenance?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setFuelLogs(json.data.fuelLogs);
      setMaintLogs(json.data.maintLogs);
      setVehicles(json.data.vehicles);
      setKpis(json.data.kpis);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, [filterVehicle]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormError(null);
    try {
      let body;
      if (tab === "fuel") {
        body = { type: "fuel", vehicleInfo: fuelForm.vehicleInfo, date: fuelForm.date, liters: parseFloat(fuelForm.liters) || 0, pricePerLiter: fuelForm.pricePerLiter ? parseFloat(fuelForm.pricePerLiter) : undefined, totalCost: fuelForm.totalCost ? parseFloat(fuelForm.totalCost) : undefined, odometer: fuelForm.odometer ? parseInt(fuelForm.odometer) : undefined, driver: fuelForm.driver || undefined, station: fuelForm.station || undefined };
      } else {
        body = { type: "maintenance", vehicleInfo: maintForm.vehicleInfo, date: maintForm.date, maintenanceType: maintForm.maintenanceType, description: maintForm.description || undefined, cost: maintForm.cost ? parseFloat(maintForm.cost) : undefined, odometer: maintForm.odometer ? parseInt(maintForm.odometer) : undefined, shop: maintForm.shop || undefined, nextServiceDate: maintForm.nextServiceDate || null };
      }
      const res  = await fetch("/api/admin/office-admin/fuel-maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false);
      setFuelForm({ ...EMPTY_FUEL });
      setMaintForm({ ...EMPTY_MAINT });
      load();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, type: "fuel" | "maintenance") => {
    try {
      const res  = await fetch(`/api/admin/office-admin/fuel-maintenance?id=${id}&type=${type}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDeleteId(null); load();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div className="p-6 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/admin/admin/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="h-3 w-3" /><span className="text-slate-700 font-medium">Fuel & Maintenance</span>
      </nav>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0"><Fuel className="h-5 w-5 text-white" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Fuel & Maintenance</h1>
            <p className="text-xs text-slate-400">Vehicle fuel logs, odometer tracking, and service records</p>
          </div>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">
          <Plus className="h-3.5 w-3.5" /> Log Entry
        </button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Vehicles",      value: kpis.totalVehicles,            icon: <Car className="h-4 w-4 text-slate-500" />,       format: "num" },
          { label: "Fuel Logs",     value: kpis.totalFuelLogs,            icon: <Fuel className="h-4 w-4 text-emerald-600" />,    format: "num" },
          { label: "Maint. Logs",   value: kpis.totalMaintLogs,           icon: <Wrench className="h-4 w-4 text-amber-600" />,    format: "num" },
          { label: "Total Liters",  value: kpis.totalLiters,              icon: <Droplets className="h-4 w-4 text-blue-500" />,   format: "dec" },
          { label: "Fuel Cost",     value: kpis.totalFuelCost,            icon: <DollarSign className="h-4 w-4 text-emerald-600" />, format: "money" },
          { label: "Maint. Cost",   value: kpis.totalMaintCost,           icon: <DollarSign className="h-4 w-4 text-amber-600" />,  format: "money" },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1"><p className="text-[10px] text-slate-500">{k.label}</p>{k.icon}</div>
            <p className="text-lg font-bold text-slate-900 tabular-nums">
              {k.format === "money" ? fmt(Number(k.value)) : k.format === "dec" ? Number(k.value).toFixed(1) : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Log Entry form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-semibold text-slate-800">Log Entry</h2>
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {(["fuel", "maintenance"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${tab === t ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                  {t === "fuel" ? "Fuel" : "Maintenance"}
                </button>
              ))}
            </div>
          </div>
          {formError && <p className="text-xs text-red-600 mb-3">{formError}</p>}
          <form onSubmit={handleSave} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tab === "fuel" ? (
              <>
                {[
                  { key: "vehicleInfo", label: "Vehicle *", required: true },
                  { key: "date", label: "Date *", type: "date", required: true },
                  { key: "driver", label: "Driver" },
                  { key: "liters", label: "Liters *", type: "number", required: true },
                  { key: "pricePerLiter", label: "Price/Liter", type: "number" },
                  { key: "totalCost", label: "Total Cost", type: "number" },
                  { key: "odometer", label: "Odometer (km)", type: "number" },
                  { key: "station", label: "Station" },
                ].map(({ key, label, required, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input required={required} type={type ?? "text"} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined}
                      value={(fuelForm as Record<string, string>)[key]}
                      onChange={(e) => setFuelForm({ ...fuelForm, [key]: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { key: "vehicleInfo", label: "Vehicle *", required: true },
                  { key: "date", label: "Date *", type: "date", required: true },
                  { key: "maintenanceType", label: "Type *", required: true },
                  { key: "shop", label: "Shop / Service Center" },
                  { key: "cost", label: "Cost", type: "number" },
                  { key: "odometer", label: "Odometer (km)", type: "number" },
                  { key: "nextServiceDate", label: "Next Service Date", type: "date" },
                ].map(({ key, label, required, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                    <input required={required} type={type ?? "text"} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined}
                      value={(maintForm as Record<string, string>)[key]}
                      onChange={(e) => setMaintForm({ ...maintForm, [key]: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                ))}
                <div className="col-span-2 sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <textarea value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })}
                    rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
              </>
            )}
            <div className="col-span-2 sm:col-span-3 flex gap-2 justify-end mt-1">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save Log
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter + tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          {(["fuel", "maintenance"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tab === t ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "fuel" ? <><Fuel className="h-3 w-3" /> Fuel Logs</> : <><Wrench className="h-3 w-3" /> Maintenance</>}
            </button>
          ))}
        </div>
        {vehicles.length > 0 && (
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-2 bg-white">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)} className="text-xs text-slate-600 bg-transparent focus:outline-none">
              <option value="">All Vehicles</option>
              {vehicles.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        )}
        <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : tab === "fuel" ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Vehicle", "Date", "Driver", "Liters", "₱/Liter", "Total Cost", "Odometer", "Station", "Actions"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fuelLogs.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No fuel logs</td></tr>
                ) : fuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{log.vehicleInfo}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(log.date)}</td>
                    <td className="px-4 py-3 text-slate-500">{log.driver ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-blue-700">{Number(log.liters).toFixed(2)}L</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{log.pricePerLiter ? fmt(Number(log.pricePerLiter)) : "—"}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{log.totalCost ? fmt(Number(log.totalCost)) : "—"}</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{log.odometer ? `${log.odometer.toLocaleString()} km` : "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{log.station ?? "—"}</td>
                    <td className="px-4 py-3">
                      {deleteId === log.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(log.id, "fuel")} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(log.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Vehicle", "Date", "Type", "Description", "Cost", "Odometer", "Shop", "Next Service", "Actions"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintLogs.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No maintenance logs</td></tr>
                ) : maintLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{log.vehicleInfo}</td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(log.date)}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-full">{log.maintenanceType}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-40 truncate">{log.description ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-amber-700">{log.cost ? fmt(Number(log.cost)) : "—"}</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{log.odometer ? `${log.odometer.toLocaleString()} km` : "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{log.shop ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{log.nextServiceDate ? fmtDate(log.nextServiceDate) : "—"}</td>
                    <td className="px-4 py-3">
                      {deleteId === log.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(log.id, "maintenance")} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(log.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
