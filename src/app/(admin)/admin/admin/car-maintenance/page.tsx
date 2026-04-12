"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Car, Fuel, X } from "lucide-react";

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
const LABEL = "block text-xs text-slate-500 mb-1";

type Maintenance = { id: string; vehicleInfo: string; date: string; maintenanceType: string; description: string | null; cost: number | null; odometer: number | null; shop: string | null; nextServiceDate: string | null; };
type FuelLog     = { id: string; vehicleInfo: string; date: string; liters: number; pricePerLiter: number | null; totalCost: number | null; odometer: number | null; driver: string | null; station: string | null; };

const MAINTENANCE_TYPES = ["Oil Change","Tire Rotation","Brake Service","Battery Replacement","Air Filter","Coolant Flush","Transmission Service","Wheel Alignment","General Inspection","Other"];

export default function CarMaintenancePage() {
  const [tab, setTab]             = useState<"maintenance"|"fuel">("maintenance");
  const [maintenance, setMaint]   = useState<Maintenance[]>([]);
  const [fuelLogs, setFuel]       = useState<FuelLog[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [mForm, setMForm] = useState({ vehicleInfo:"", date: new Date().toISOString().split("T")[0], maintenanceType:"Oil Change", description:"", cost:"", odometer:"", shop:"", nextServiceDate:"" });
  const [fForm, setFForm] = useState({ vehicleInfo:"", date: new Date().toISOString().split("T")[0], liters:"", pricePerLiter:"", totalCost:"", odometer:"", driver:"", station:"" });

  const load = useCallback(async () => {
    setLoading(true);
    const [m, f] = await Promise.all([
      fetch("/api/admin/dept/car-maintenance").then((r) => r.json()),
      fetch("/api/admin/dept/fuel-logs").then((r) => r.json()),
    ]);
    if (m.success) setMaint(m.data);
    if (f.success) setFuel(f.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sm = (k: string, v: string) => setMForm((p) => ({ ...p, [k]: v }));
  const sf = (k: string, v: string) => setFForm((p) => ({ ...p, [k]: v }));

  const handleSaveMaint = async () => {
    if (!mForm.vehicleInfo || !mForm.date || !mForm.maintenanceType) { setError("Vehicle, date, and type are required."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/dept/car-maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...mForm, cost: mForm.cost ? parseFloat(mForm.cost) : undefined, odometer: mForm.odometer ? parseInt(mForm.odometer) : undefined, description: mForm.description || undefined, shop: mForm.shop || undefined, nextServiceDate: mForm.nextServiceDate || undefined }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowForm(false); load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleSaveFuel = async () => {
    if (!fForm.vehicleInfo || !fForm.date || !fForm.liters) { setError("Vehicle, date, and liters are required."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/dept/fuel-logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fForm, liters: parseFloat(fForm.liters), pricePerLiter: fForm.pricePerLiter ? parseFloat(fForm.pricePerLiter) : undefined, totalCost: fForm.totalCost ? parseFloat(fForm.totalCost) : undefined, odometer: fForm.odometer ? parseInt(fForm.odometer) : undefined, driver: fForm.driver || undefined, station: fForm.station || undefined }) });
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
          <h1 className="text-xl font-bold text-slate-900">Car Maintenance & Fuel</h1>
          <p className="text-sm text-slate-500">Track vehicle maintenance schedules and fuel consumption</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(null); }} className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700">
          <Plus className="h-4 w-4" /> Add Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(["maintenance","fuel"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-white shadow text-teal-700" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "maintenance" ? <Car className="h-4 w-4" /> : <Fuel className="h-4 w-4" />}
            {t === "maintenance" ? "Maintenance" : "Fuel Logs"}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Add {tab === "maintenance" ? "Maintenance Log" : "Fuel Log"}</h2>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
            {/* Which form to show */}
            {tab === "maintenance" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className={LABEL}>Vehicle Info *</label><input className={FIELD} placeholder="Plate no. / Model" value={mForm.vehicleInfo} onChange={(e) => sm("vehicleInfo",e.target.value)} /></div>
                  <div><label className={LABEL}>Date *</label><input type="date" className={FIELD} value={mForm.date} onChange={(e) => sm("date",e.target.value)} /></div>
                  <div>
                    <label className={LABEL}>Type *</label>
                    <select className={FIELD} value={mForm.maintenanceType} onChange={(e) => sm("maintenanceType",e.target.value)}>
                      {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className={LABEL}>Cost (₱)</label><input type="number" min="0" className={FIELD} value={mForm.cost} onChange={(e) => sm("cost",e.target.value)} /></div>
                  <div><label className={LABEL}>Odometer (km)</label><input type="number" min="0" className={FIELD} value={mForm.odometer} onChange={(e) => sm("odometer",e.target.value)} /></div>
                  <div><label className={LABEL}>Shop / Service Center</label><input className={FIELD} value={mForm.shop} onChange={(e) => sm("shop",e.target.value)} /></div>
                  <div><label className={LABEL}>Next Service Date</label><input type="date" className={FIELD} value={mForm.nextServiceDate} onChange={(e) => sm("nextServiceDate",e.target.value)} /></div>
                </div>
                <div><label className={LABEL}>Description</label><textarea className={FIELD} rows={2} value={mForm.description} onChange={(e) => sm("description",e.target.value)} /></div>
                <div className="flex gap-2">
                  <button onClick={handleSaveMaint} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving && <Loader2 className="h-3 w-3 animate-spin" />}Save</button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className={LABEL}>Vehicle Info *</label><input className={FIELD} placeholder="Plate no. / Model" value={fForm.vehicleInfo} onChange={(e) => sf("vehicleInfo",e.target.value)} /></div>
                  <div><label className={LABEL}>Date *</label><input type="date" className={FIELD} value={fForm.date} onChange={(e) => sf("date",e.target.value)} /></div>
                  <div><label className={LABEL}>Liters *</label><input type="number" step="0.01" min="0" className={FIELD} value={fForm.liters} onChange={(e) => sf("liters",e.target.value)} /></div>
                  <div><label className={LABEL}>Price / Liter (₱)</label><input type="number" step="0.01" min="0" className={FIELD} value={fForm.pricePerLiter} onChange={(e) => sf("pricePerLiter",e.target.value)} /></div>
                  <div><label className={LABEL}>Total Cost (₱)</label><input type="number" min="0" className={FIELD} value={fForm.totalCost} onChange={(e) => sf("totalCost",e.target.value)} /></div>
                  <div><label className={LABEL}>Odometer (km)</label><input type="number" min="0" className={FIELD} value={fForm.odometer} onChange={(e) => sf("odometer",e.target.value)} /></div>
                  <div><label className={LABEL}>Driver</label><input className={FIELD} value={fForm.driver} onChange={(e) => sf("driver",e.target.value)} /></div>
                  <div className="col-span-2"><label className={LABEL}>Gas Station</label><input className={FIELD} value={fForm.station} onChange={(e) => sf("station",e.target.value)} /></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveFuel} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving && <Loader2 className="h-3 w-3 animate-spin" />}Save</button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
      ) : tab === "maintenance" ? (
        maintenance.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400"><Car className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No maintenance logs yet.</p></div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Vehicle","Date","Type","Cost","Odometer","Shop","Next Service"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{m.vehicleInfo}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(m.date).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{m.maintenanceType}</span></td>
                    <td className="px-4 py-3 text-slate-700">{m.cost ? `₱${Number(m.cost).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{m.odometer ? `${m.odometer.toLocaleString()} km` : "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{m.shop ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{m.nextServiceDate ? new Date(m.nextServiceDate).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"}) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        fuelLogs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400"><Fuel className="h-10 w-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No fuel logs yet.</p></div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Vehicle","Date","Liters","Price/L","Total Cost","Odometer","Driver","Station"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fuelLogs.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{f.vehicleInfo}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(f.date).toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}</td>
                    <td className="px-4 py-3 text-slate-700">{Number(f.liters).toFixed(2)} L</td>
                    <td className="px-4 py-3 text-slate-600">{f.pricePerLiter ? `₱${Number(f.pricePerLiter).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{f.totalCost ? `₱${Number(f.totalCost).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{f.odometer ? `${f.odometer.toLocaleString()} km` : "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{f.driver ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{f.station ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
