"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck, Car, Plus, Loader2, RefreshCw, Pencil, Trash2,
  Check, X, MapPin, Calendar, User, Package, Filter,
} from "lucide-react";

type DeliveryStatus = "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

interface Vehicle {
  id: string; name: string; plateNumber: string; vehicleType: string;
  driver: string | null; status: string; notes: string | null; createdAt: string;
}
interface Delivery {
  id: string; vehicleId: string | null; title: string; origin: string;
  destination: string; scheduledAt: string; deliveredAt: string | null;
  driver: string | null; status: DeliveryStatus; cargo: string | null;
  notes: string | null; createdAt: string;
  vehicle?: { name: string; plateNumber: string } | null;
}
interface Counts { SCHEDULED: number; IN_TRANSIT: number; DELIVERED: number; CANCELLED: number; }

const STATUS_CFG: Record<DeliveryStatus, { label: string; bg: string; text: string; dot: string }> = {
  SCHEDULED:  { label: "Scheduled",  bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  IN_TRANSIT: { label: "In Transit", bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500"  },
  DELIVERED:  { label: "Delivered",  bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  CANCELLED:  { label: "Cancelled",  bg: "bg-slate-100", text: "text-slate-500",  dot: "bg-slate-400"  },
};

const fmtDT  = (d: string) => new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const toLocal = (d: string) => { const dt = new Date(d); dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset()); return dt.toISOString().slice(0, 16); };

const EMPTY_VEH  = { name: "", plateNumber: "", vehicleType: "", driver: "", status: "ACTIVE", notes: "" };
const EMPTY_DEL  = { vehicleId: "", title: "", origin: "", destination: "", scheduledAt: "", driver: "", status: "SCHEDULED" as DeliveryStatus, cargo: "", notes: "" };

export default function LogisticsPage() {
  const [view, setView]           = useState<"deliveries" | "fleet">("deliveries");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [vehicles, setVehicles]   = useState<Vehicle[]>([]);
  const [counts, setCounts]       = useState<Counts>({ SCHEDULED: 0, IN_TRANSIT: 0, DELIVERED: 0, CANCELLED: 0 });
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");
  const [showDelForm, setShowDelForm] = useState(false);
  const [showVehForm, setShowVehForm] = useState(false);
  const [delForm, setDelForm]     = useState({ ...EMPTY_DEL });
  const [vehForm, setVehForm]     = useState({ ...EMPTY_VEH });
  const [editDel, setEditDel]     = useState<Delivery | null>(null);
  const [editVeh, setEditVeh]     = useState<Vehicle | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ resource: "deliveries" });
      if (statusFilter) p.set("status", statusFilter);
      const res  = await fetch(`/api/admin/office-admin/logistics?${p}`);
      const json = await res.json();
      if (json.success) { setDeliveries(json.data); setCounts(json.counts); }
    } finally { setLoading(false); }
  }, [statusFilter]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/office-admin/logistics?resource=vehicles");
      const json = await res.json();
      if (json.success) setVehicles(json.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { view === "deliveries" ? loadDeliveries() : loadVehicles(); }, [view, loadDeliveries, loadVehicles]);

  async function saveDelivery() {
    if (!delForm.title || !delForm.origin || !delForm.destination || !delForm.scheduledAt) return alert("Title, origin, destination and scheduled time are required.");
    setSaving(true);
    try {
      const body = { ...delForm, vehicleId: delForm.vehicleId || null, driver: delForm.driver || null, cargo: delForm.cargo || null, notes: delForm.notes || null };
      const method = editDel ? "PATCH" : "POST";
      const payload = editDel ? { ...body, id: editDel.id } : body;
      const res  = await fetch("/api/admin/office-admin/logistics", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowDelForm(false); setEditDel(null); setDelForm({ ...EMPTY_DEL }); loadDeliveries();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function saveVehicle() {
    if (!vehForm.name || !vehForm.plateNumber || !vehForm.vehicleType) return alert("Name, plate and type are required.");
    setSaving(true);
    try {
      const body = { resource: "vehicle", ...vehForm, driver: vehForm.driver || null, notes: vehForm.notes || null };
      const method = editVeh ? "PATCH" : "POST";
      const payload = editVeh ? { ...body, id: editVeh.id } : body;
      const res  = await fetch("/api/admin/office-admin/logistics", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setShowVehForm(false); setEditVeh(null); setVehForm({ ...EMPTY_VEH }); loadVehicles();
    } catch (e) { alert(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: DeliveryStatus) {
    await fetch("/api/admin/office-admin/logistics", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    loadDeliveries();
  }

  async function handleDelete(id: string, resource: string) {
    await fetch(`/api/admin/office-admin/logistics?id=${id}&resource=${resource}`, { method: "DELETE" });
    setDeleteId(null);
    resource === "vehicle" ? loadVehicles() : loadDeliveries();
  }

  function openEditDel(d: Delivery) {
    setDelForm({ vehicleId: d.vehicleId ?? "", title: d.title, origin: d.origin, destination: d.destination, scheduledAt: toLocal(d.scheduledAt), driver: d.driver ?? "", status: d.status, cargo: d.cargo ?? "", notes: d.notes ?? "" });
    setEditDel(d); setShowDelForm(true);
  }

  function openEditVeh(v: Vehicle) {
    setVehForm({ name: v.name, plateNumber: v.plateNumber, vehicleType: v.vehicleType, driver: v.driver ?? "", status: v.status, notes: v.notes ?? "" });
    setEditVeh(v); setShowVehForm(true);
  }

  const thCls = "px-4 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap";
  const tdCls = "px-4 py-3 text-sm";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Logistics</h1>
            <p className="text-xs text-slate-400">Fleet management, deliveries, and route planning</p>
          </div>
        </div>
        <div className="flex gap-2">
          {view === "deliveries" && (
            <button onClick={() => { setShowDelForm((v)=>!v); setEditDel(null); setDelForm({...EMPTY_DEL}); }}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">
              <Plus className="h-3.5 w-3.5" /> Add Delivery
            </button>
          )}
          {view === "fleet" && (
            <button onClick={() => { setShowVehForm((v)=>!v); setEditVeh(null); setVehForm({...EMPTY_VEH}); }}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">
              <Plus className="h-3.5 w-3.5" /> Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Tab + KPIs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-0.5 w-fit">
        {([["deliveries", "Deliveries", Truck], ["fleet", "Fleet", Car]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setView(key as "deliveries"|"fleet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${view===key?"bg-slate-700 text-white":"text-slate-500 hover:text-slate-700"}`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {view === "deliveries" && (
        <div className="grid grid-cols-4 gap-3">
          {(["SCHEDULED","IN_TRANSIT","DELIVERED","CANCELLED"] as DeliveryStatus[]).map((s) => {
            const sc = STATUS_CFG[s];
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter===s?"":s)}
                className={`rounded-xl p-3 text-center border transition-all ${statusFilter===s?`${sc.bg} border-current ${sc.text} shadow-sm`:"bg-white border-slate-200 hover:border-slate-300"}`}>
                <div className={`text-2xl font-bold ${statusFilter===s?sc.text:"text-slate-800"}`}>{counts[s]}</div>
                <div className={`text-xs mt-0.5 ${statusFilter===s?sc.text:"text-slate-500"}`}>{sc.label}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Delivery Form */}
      {showDelForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">{editDel ? "Edit Delivery" : "New Delivery"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
              <input value={delForm.title} onChange={(e)=>setDelForm({...delForm,title:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            {[{key:"origin",label:"Origin *"},{key:"destination",label:"Destination *"},{key:"driver",label:"Driver"},{key:"cargo",label:"Cargo / Items"}].map(({key,label})=>(
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input value={(delForm as Record<string,string>)[key]} onChange={(e)=>setDelForm({...delForm,[key]:e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Scheduled Date & Time *</label>
              <input type="datetime-local" value={delForm.scheduledAt} onChange={(e)=>setDelForm({...delForm,scheduledAt:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle</label>
              <select value={delForm.vehicleId} onChange={(e)=>setDelForm({...delForm,vehicleId:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">— None —</option>
                {vehicles.map((v)=><option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={delForm.status} onChange={(e)=>setDelForm({...delForm,status:e.target.value as DeliveryStatus})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                {(["SCHEDULED","IN_TRANSIT","DELIVERED","CANCELLED"] as DeliveryStatus[]).map((s)=><option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <textarea value={delForm.notes} onChange={(e)=>setDelForm({...delForm,notes:e.target.value})} rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={()=>{setShowDelForm(false);setEditDel(null);}} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={saveDelivery} disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} {editDel ? "Save Changes" : "Add Delivery"}
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Form */}
      {showVehForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">{editVeh ? "Edit Vehicle" : "New Vehicle"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[{key:"name",label:"Name *"},{key:"plateNumber",label:"Plate Number *"},{key:"vehicleType",label:"Type *"},{key:"driver",label:"Assigned Driver"}].map(({key,label})=>(
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input value={(vehForm as Record<string,string>)[key]} onChange={(e)=>setVehForm({...vehForm,[key]:e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={vehForm.status} onChange={(e)=>setVehForm({...vehForm,status:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                {["ACTIVE","INACTIVE","MAINTENANCE"].map((s)=><option key={s} value={s}>{s.charAt(0)+s.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <input value={vehForm.notes} onChange={(e)=>setVehForm({...vehForm,notes:e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button onClick={()=>{setShowVehForm(false);setEditVeh(null);}} className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={saveVehicle} disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} {editVeh ? "Save Changes" : "Add Vehicle"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 justify-end">
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-2 bg-white">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          {view === "deliveries" ? (
            <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value as DeliveryStatus|"")}
              className="text-xs text-slate-600 bg-transparent focus:outline-none">
              <option value="">All Statuses</option>
              {(["SCHEDULED","IN_TRANSIT","DELIVERED","CANCELLED"] as DeliveryStatus[]).map((s)=><option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
            </select>
          ) : <span className="text-xs text-slate-500">Fleet</span>}
        </div>
        <button onClick={() => view==="deliveries"?loadDeliveries():loadVehicles()} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"><RefreshCw className="h-3.5 w-3.5" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
      ) : view === "deliveries" ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["#","Title","Origin → Destination","Scheduled","Driver","Vehicle","Cargo","Status","Actions"].map((h)=><th key={h} className={thCls}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveries.length===0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No deliveries. Click "Add Delivery" to create one.</td></tr>
                ) : deliveries.map((d,i)=>{
                  const sc = STATUS_CFG[d.status];
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className={`${tdCls} text-xs text-slate-400 tabular-nums`}>{i+1}</td>
                      <td className={`${tdCls} font-medium text-slate-800`}>{d.title}</td>
                      <td className={`${tdCls} text-slate-600 text-xs`}>
                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400 shrink-0" />{d.origin}</div>
                        <div className="flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3 text-emerald-500 shrink-0" />{d.destination}</div>
                      </td>
                      <td className={`${tdCls} text-slate-500 text-xs whitespace-nowrap`}><Calendar className="h-3 w-3 inline mr-1 text-slate-400" />{fmtDT(d.scheduledAt)}</td>
                      <td className={`${tdCls} text-slate-500 text-xs`}>{d.driver ? <><User className="h-3 w-3 inline mr-1" />{d.driver}</> : "—"}</td>
                      <td className={`${tdCls} text-slate-500 text-xs`}>{d.vehicle ? `${d.vehicle.name} (${d.vehicle.plateNumber})` : "—"}</td>
                      <td className={`${tdCls} text-slate-500 text-xs`}>{d.cargo ? <><Package className="h-3 w-3 inline mr-1" />{d.cargo}</> : "—"}</td>
                      <td className={tdCls}>
                        <select value={d.status} onChange={(e)=>updateStatus(d.id, e.target.value as DeliveryStatus)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${sc.bg} ${sc.text}`}>
                          {(["SCHEDULED","IN_TRANSIT","DELIVERED","CANCELLED"] as DeliveryStatus[]).map((s)=><option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                        </select>
                      </td>
                      <td className={tdCls}>
                        <div className="flex items-center gap-1">
                          <button onClick={()=>openEditDel(d)} className="p-1.5 rounded text-blue-500 hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" /></button>
                          {deleteId===d.id ? (
                            <>
                              <button onClick={()=>handleDelete(d.id,"delivery")} className="p-1.5 rounded text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                              <button onClick={()=>setDeleteId(null)} className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                            </>
                          ) : (
                            <button onClick={()=>setDeleteId(d.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["#","Name","Plate","Type","Driver","Status","Notes","Actions"].map((h)=><th key={h} className={thCls}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.length===0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No vehicles. Click "Add Vehicle" to register one.</td></tr>
                ) : vehicles.map((v,i)=>(
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className={`${tdCls} text-xs text-slate-400`}>{i+1}</td>
                    <td className={`${tdCls} font-medium text-slate-800`}>{v.name}</td>
                    <td className={`${tdCls} font-mono text-xs text-slate-600`}>{v.plateNumber}</td>
                    <td className={`${tdCls} text-slate-500`}>{v.vehicleType}</td>
                    <td className={`${tdCls} text-slate-500`}>{v.driver ?? "—"}</td>
                    <td className={tdCls}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.status==="ACTIVE"?"bg-green-100 text-green-700":v.status==="MAINTENANCE"?"bg-amber-100 text-amber-700":"bg-slate-100 text-slate-500"}`}>
                        {v.status.charAt(0)+v.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className={`${tdCls} text-slate-400 text-xs`}>{v.notes ?? "—"}</td>
                    <td className={tdCls}>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>openEditVeh(v)} className="p-1.5 rounded text-blue-500 hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" /></button>
                        {deleteId===v.id ? (
                          <>
                            <button onClick={()=>handleDelete(v.id,"vehicle")} className="p-1.5 rounded text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={()=>setDeleteId(null)} className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                          </>
                        ) : (
                          <button onClick={()=>setDeleteId(v.id)} className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
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
