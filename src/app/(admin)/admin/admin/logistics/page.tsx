"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Loader2, Truck, X, Pencil, Trash2, Clock,
  Search, RefreshCw, MapPin, Package, ArrowRight,
} from "lucide-react";
import { HistoryPanel } from "@/components/admin/office-admin/HistoryPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type VehicleStatus  = "ACTIVE" | "MAINTENANCE" | "RETIRED";
type DeliveryStatus = "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
type Tab            = "vehicles" | "deliveries";

interface Vehicle {
  id:          string;
  name:        string;
  plateNumber: string | null;
  vehicleType: string;
  driver:      string | null;
  status:      VehicleStatus;
  notes:       string | null;
}

interface Delivery {
  id:          string;
  vehicleId:   string | null;
  origin:      string;
  destination: string;
  scheduledAt: string;
  cargo:       string | null;
  status:      DeliveryStatus;
  notes:       string | null;
  vehicle:     { id: string; name: string; plateNumber: string | null } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  ACTIVE:      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  MAINTENANCE: "bg-amber-50 text-amber-700 border border-amber-200",
  RETIRED:     "bg-slate-100 text-slate-500 border border-slate-200",
};

const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  SCHEDULED:  "bg-blue-50 text-blue-700 border border-blue-200",
  IN_TRANSIT: "bg-amber-50 text-amber-700 border border-amber-200",
  DELIVERED:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED:  "bg-slate-100 text-slate-500 border border-slate-200",
};

const VEHICLE_TYPES = ["Van", "Truck", "Motorcycle", "Car", "Other"];
const DELIVERY_STATUSES: DeliveryStatus[] = ["SCHEDULED", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

const FIELD = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
const LABEL = "block text-xs font-medium text-slate-500 mb-1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── VehicleModal ─────────────────────────────────────────────────────────────

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}

function VehicleModal({ vehicle, onClose, onSaved }: VehicleModalProps) {
  const [form, setForm] = useState({
    name: vehicle?.name ?? "",
    plateNumber: vehicle?.plateNumber ?? "",
    vehicleType: vehicle?.vehicleType ?? "Van",
    driver: vehicle?.driver ?? "",
    status: (vehicle?.status ?? "ACTIVE") as VehicleStatus,
    notes: vehicle?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Vehicle name is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = {
        name:        form.name.trim(),
        plateNumber: form.plateNumber.trim() || null,
        vehicleType: form.vehicleType,
        driver:      form.driver.trim() || null,
        status:      form.status,
        notes:       form.notes.trim() || null,
      };
      const url = vehicle
        ? `/api/admin/office-admin/logistics?tab=vehicles&id=${vehicle.id}`
        : "/api/admin/office-admin/logistics?tab=vehicles";
      const res  = await fetch(url, {
        method: vehicle ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            {vehicle ? "Edit Vehicle" : "Add Vehicle"}
          </h2>
          <button onClick={onClose}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={LABEL}>Vehicle Name *</label>
              <input className={FIELD} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Delivery Van 1" />
            </div>
            <div>
              <label className={LABEL}>Plate Number</label>
              <input className={FIELD} value={form.plateNumber} onChange={(e) => set("plateNumber", e.target.value)} placeholder="e.g. ABC 1234" />
            </div>
            <div>
              <label className={LABEL}>Vehicle Type</label>
              <select className={FIELD} value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)}>
                {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Driver</label>
              <input className={FIELD} value={form.driver} onChange={(e) => set("driver", e.target.value)} placeholder="Driver name" />
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select className={FIELD} value={form.status} onChange={(e) => set("status", e.target.value as VehicleStatus)}>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Notes</label>
              <textarea className={FIELD} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DeliveryModal ────────────────────────────────────────────────────────────

interface DeliveryModalProps {
  delivery:  Delivery | null;
  vehicles:  Vehicle[];
  onClose:   () => void;
  onSaved:   () => void;
}

function DeliveryModal({ delivery, vehicles, onClose, onSaved }: DeliveryModalProps) {
  const toDatetimeLocal = (iso: string | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    origin:      delivery?.origin ?? "",
    destination: delivery?.destination ?? "",
    scheduledAt: delivery ? toDatetimeLocal(delivery.scheduledAt) : "",
    vehicleId:   delivery?.vehicleId ?? "",
    cargo:       delivery?.cargo ?? "",
    status:      (delivery?.status ?? "SCHEDULED") as DeliveryStatus,
    notes:       delivery?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.origin.trim())      { setError("Origin is required."); return; }
    if (!form.destination.trim()) { setError("Destination is required."); return; }
    if (!form.scheduledAt)        { setError("Scheduled date/time is required."); return; }
    setSaving(true); setError(null);
    try {
      const body = {
        origin:      form.origin.trim(),
        destination: form.destination.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        vehicleId:   form.vehicleId || null,
        cargo:       form.cargo.trim() || null,
        status:      form.status,
        notes:       form.notes.trim() || null,
      };
      const url = delivery
        ? `/api/admin/office-admin/logistics?tab=deliveries&id=${delivery.id}`
        : "/api/admin/office-admin/logistics?tab=deliveries";
      const res  = await fetch(url, {
        method: delivery ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            {delivery ? "Edit Delivery" : "Add Delivery"}
          </h2>
          <button onClick={onClose}><X className="h-4 w-4 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Origin *</label>
              <input className={FIELD} value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="e.g. Warehouse A" />
            </div>
            <div>
              <label className={LABEL}>Destination *</label>
              <input className={FIELD} value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="e.g. Branch B" />
            </div>
            <div>
              <label className={LABEL}>Scheduled At *</label>
              <input type="datetime-local" className={FIELD} value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Vehicle</label>
              <select className={FIELD} value={form.vehicleId} onChange={(e) => set("vehicleId", e.target.value)}>
                <option value="">— No vehicle —</option>
                {vehicles.filter((v) => v.status === "ACTIVE").map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}{v.plateNumber ? ` (${v.plateNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Cargo</label>
              <input className={FIELD} value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="What's being delivered?" />
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select className={FIELD} value={form.status} onChange={(e) => set("status", e.target.value as DeliveryStatus)}>
                {DELIVERY_STATUSES.map((s) => (
                  <option key={s} value={s}>{fmtLabel(s)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Notes</label>
              <textarea className={FIELD} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LogisticsPage() {
  const [tab, setTab]               = useState<Tab>("vehicles");
  const [vehicles, setVehicles]     = useState<Vehicle[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats]           = useState({ vehicles: 0, scheduled: 0, inTransit: 0, delivered: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryStatus | "">("");

  const [vehicleModal, setVehicleModal]   = useState<Vehicle | null | "new">(null);
  const [deliveryModal, setDeliveryModal] = useState<Delivery | null | "new">(null);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ id: string; label: string } | null>(null);

  // ── load stats ─────────────────────────────────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/office-admin/logistics?stats=1");
      const json = await res.json();
      if (json.success ?? json.vehicles !== undefined) {
        setStats({
          vehicles:  json.vehicles  ?? 0,
          scheduled: json.scheduled ?? 0,
          inTransit: json.inTransit ?? 0,
          delivered: json.delivered ?? 0,
        });
      }
    } catch {}
  }, []);

  // ── load vehicles ──────────────────────────────────────────────────────────

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/office-admin/logistics?tab=vehicles");
      const json = await res.json();
      if (Array.isArray(json)) setVehicles(json);
      else if (json.success && Array.isArray(json.data)) setVehicles(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── load deliveries ────────────────────────────────────────────────────────

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ tab: "deliveries" });
      if (deliveryFilter) p.set("status", deliveryFilter);
      const res  = await fetch(`/api/admin/office-admin/logistics?${p}`);
      const json = await res.json();
      if (Array.isArray(json)) setDeliveries(json);
      else if (json.success && Array.isArray(json.data)) setDeliveries(json.data);
    } finally {
      setLoading(false);
    }
  }, [deliveryFilter]);

  const reload = useCallback(() => {
    void loadStats();
    if (tab === "vehicles")   void loadVehicles();
    if (tab === "deliveries") void loadDeliveries();
  }, [tab, loadStats, loadVehicles, loadDeliveries]);

  useEffect(() => { void loadStats(); }, [loadStats]);
  useEffect(() => {
    if (tab === "vehicles")   void loadVehicles();
    if (tab === "deliveries") void loadDeliveries();
  }, [tab, loadVehicles, loadDeliveries]);

  // ── delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    setDeletingId(id);
    try {
      const param = tab === "vehicles" ? `tab=vehicles&id=${id}` : `tab=deliveries&id=${id}`;
      const res   = await fetch(`/api/admin/office-admin/logistics?${param}`, { method: "DELETE" });
      const json  = await res.json();
      if (!json.success) throw new Error(json.error ?? "Delete failed");
      reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ── filtered data ──────────────────────────────────────────────────────────

  const filteredVehicles = vehicles.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.plateNumber ?? "").toLowerCase().includes(q) ||
      (v.driver ?? "").toLowerCase().includes(q) ||
      v.vehicleType.toLowerCase().includes(q)
    );
  });

  const filteredDeliveries = deliveries.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.origin.toLowerCase().includes(q) ||
      d.destination.toLowerCase().includes(q) ||
      (d.cargo ?? "").toLowerCase().includes(q) ||
      (d.vehicle?.name ?? "").toLowerCase().includes(q)
    );
  });

  // ── KPI strip data ─────────────────────────────────────────────────────────

  const kpis = [
    { label: "Active Vehicles", value: stats.vehicles,  color: "text-emerald-600" },
    { label: "Scheduled",       value: stats.scheduled, color: "text-blue-600" },
    { label: "In Transit",      value: stats.inTransit, color: "text-amber-600" },
    { label: "Delivered",       value: stats.delivered, color: "text-slate-700" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-500" /> Logistics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Fleet management and delivery tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => tab === "vehicles" ? setVehicleModal("new") : setDeliveryModal("new")}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            {tab === "vehicles" ? "Add Vehicle" : "Add Delivery"}
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 tabular-nums ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {([
          { key: "vehicles"   as Tab, label: "Fleet",      icon: Truck   },
          { key: "deliveries" as Tab, label: "Deliveries", icon: Package },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(""); setDeliveryFilter(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "vehicles" ? "Search vehicles…" : "Search deliveries…"}
            className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 w-56"
          />
        </div>

        {tab === "deliveries" && (
          <div className="flex gap-1 flex-wrap">
            {([["", "All"], ...DELIVERY_STATUSES.map((s) => [s, fmtLabel(s)])] as [string, string][]).map(([val, label]) => (
              <button
                key={val || "all"}
                onClick={() => setDeliveryFilter(val as DeliveryStatus | "")}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  deliveryFilter === val
                    ? "bg-amber-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : tab === "vehicles" ? (
        <>
          {/* ── Fleet: Desktop table ── */}
          {filteredVehicles.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Truck className="h-10 w-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">No vehicles found</p>
              <button onClick={() => setVehicleModal("new")} className="mt-3 text-xs text-amber-500 hover:underline">
                Add first vehicle
              </button>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {["Name", "Plate", "Type", "Driver", "Status", ""].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredVehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50 group">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{v.name}</p>
                            {v.notes && <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{v.notes}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{v.plateNumber ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{v.vehicleType}</td>
                          <td className="px-4 py-3 text-slate-600">{v.driver ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${VEHICLE_STATUS_COLORS[v.status]}`}>
                              {fmtLabel(v.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setVehicleModal(v)}
                                className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setHistoryTarget({ id: v.id, label: v.name })}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                title="History"
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(v.id)}
                                disabled={deletingId === v.id}
                                className="p-1 text-red-400 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                {deletingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
                  {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Mobile */}
              <div className="sm:hidden space-y-3">
                {filteredVehicles.map((v) => (
                  <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{v.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {v.vehicleType}{v.plateNumber ? ` · ${v.plateNumber}` : ""}
                        </p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${VEHICLE_STATUS_COLORS[v.status]}`}>
                        {fmtLabel(v.status)}
                      </span>
                    </div>
                    {v.driver && (
                      <p className="text-xs text-slate-500 mt-2">Driver: {v.driver}</p>
                    )}
                    {v.notes && (
                      <p className="text-xs text-slate-400 mt-1 truncate">{v.notes}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setVehicleModal(v)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => setHistoryTarget({ id: v.id, label: v.name })}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                      >
                        <Clock className="h-3 w-3" /> History
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 ml-auto"
                      >
                        {deletingId === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* ── Deliveries: Desktop table ── */}
          {filteredDeliveries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <MapPin className="h-10 w-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">No deliveries found</p>
              <button onClick={() => setDeliveryModal("new")} className="mt-3 text-xs text-amber-500 hover:underline">
                Add first delivery
              </button>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {["Route", "Vehicle", "Scheduled", "Cargo", "Status", ""].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDeliveries.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50 group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 font-medium text-slate-900">
                              <span className="truncate max-w-[120px]">{d.origin}</span>
                              <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[120px]">{d.destination}</span>
                            </div>
                            {d.notes && <p className="text-[10px] text-slate-400 truncate max-w-[260px]">{d.notes}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {d.vehicle ? (
                              <span>{d.vehicle.name}{d.vehicle.plateNumber ? <span className="text-xs text-slate-400 ml-1">({d.vehicle.plateNumber})</span> : null}</span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(d.scheduledAt)}</td>
                          <td className="px-4 py-3 text-slate-600">{d.cargo ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${DELIVERY_STATUS_COLORS[d.status]}`}>
                              {fmtLabel(d.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setDeliveryModal(d)}
                                className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setHistoryTarget({ id: d.id, label: `${d.origin} → ${d.destination}` })}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                title="History"
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(d.id)}
                                disabled={deletingId === d.id}
                                className="p-1 text-red-400 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                {deletingId === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
                  {filteredDeliveries.length} deliver{filteredDeliveries.length !== 1 ? "ies" : "y"}
                </div>
              </div>

              {/* Mobile */}
              <div className="sm:hidden space-y-3">
                {filteredDeliveries.map((d) => (
                  <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 font-semibold text-slate-900 text-sm">
                          <span className="truncate">{d.origin}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{d.destination}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{fmtDate(d.scheduledAt)}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${DELIVERY_STATUS_COLORS[d.status]}`}>
                        {fmtLabel(d.status)}
                      </span>
                    </div>
                    {d.vehicle && (
                      <p className="text-xs text-slate-500 mt-2">
                        Vehicle: {d.vehicle.name}{d.vehicle.plateNumber ? ` (${d.vehicle.plateNumber})` : ""}
                      </p>
                    )}
                    {d.cargo && (
                      <p className="text-xs text-slate-500 mt-0.5">Cargo: {d.cargo}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setDeliveryModal(d)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => setHistoryTarget({ id: d.id, label: `${d.origin} → ${d.destination}` })}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                      >
                        <Clock className="h-3 w-3" /> History
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deletingId === d.id}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 ml-auto"
                      >
                        {deletingId === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Vehicle Modal */}
      {vehicleModal !== null && (
        <VehicleModal
          vehicle={vehicleModal === "new" ? null : vehicleModal}
          onClose={() => setVehicleModal(null)}
          onSaved={reload}
        />
      )}

      {/* Delivery Modal */}
      {deliveryModal !== null && (
        <DeliveryModal
          delivery={deliveryModal === "new" ? null : deliveryModal}
          vehicles={vehicles}
          onClose={() => setDeliveryModal(null)}
          onSaved={reload}
        />
      )}

      {/* History Panel */}
      {historyTarget && (
        <HistoryPanel
          targetId={historyTarget.id}
          targetType={tab === "vehicles" ? "vehicle" : "delivery"}
          title={`History — ${historyTarget.label}`}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
