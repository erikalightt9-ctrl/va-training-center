"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Package, Wrench, Pill, Archive, Fuel, Search,
  RefreshCw, ArrowDownToLine,
  Trash2, Check, X, Loader2, AlertTriangle, TrendingDown,
  Wifi, WifiOff, Inbox, CheckCircle2, XCircle, Clock, ChevronDown,
  ShoppingBag,
} from "lucide-react";
import { ExcelGrid } from "@/components/admin/office-admin/ExcelGrid";
import type { ColDef } from "@/components/admin/office-admin/useGridEngine";

// ─── Column configs per subcard ─────────────────────────────────────────────

const COLUMNS: Record<string, ColDef[]> = {
  officeSupplies: [
    { key: "name",         label: "Item Name",  type: "text",   editable: false, width: "w-48" },
    { key: "category",     label: "Category",   type: "text",   editable: false },
    { key: "totalStock",   label: "Stock Qty",  type: "number", editable: false, width: "w-24" },
    { key: "unit",         label: "Unit",       type: "text",   editable: false },
    { key: "minThreshold", label: "Min Level",  type: "number", editable: true  },
    { key: "location",     label: "Location",   type: "text",   editable: true  },
    { key: "status",       label: "Status",     type: "status", editable: false },
  ],
  maintenanceSupplies: [
    { key: "name",         label: "Item Name",  type: "text",   editable: false, width: "w-48" },
    { key: "category",     label: "Category",   type: "text",   editable: false },
    { key: "quantity",     label: "Stock Qty",  type: "number", editable: false, width: "w-24" },
    { key: "unit",         label: "Unit",       type: "text",   editable: false },
    { key: "reorderLevel", label: "Min Level",  type: "number", editable: true  },
    { key: "location",     label: "Location",   type: "text",   editable: true  },
    { key: "supplier",     label: "Supplier",   type: "text",   editable: true  },
    { key: "status",       label: "Status",     type: "status", editable: false },
  ],
  medicalSupplies: [
    { key: "name",         label: "Item Name",  type: "text",   editable: false, width: "w-40" },
    { key: "quantity",     label: "Stock Qty",  type: "number", editable: false, width: "w-20" },
    { key: "unit",         label: "Unit",       type: "text",   editable: false },
    { key: "reorderLevel", label: "Min Level",  type: "number", editable: true  },
    { key: "expiryDate",   label: "Expiry",     type: "date",   editable: true  },
    { key: "batchNumber",  label: "Batch #",    type: "text",   editable: true  },
    { key: "supplier",     label: "Supplier",   type: "text",   editable: true  },
    { key: "status",       label: "Status",     type: "status", editable: false },
  ],
  stockroom: [
    { key: "name",         label: "Item Name",      type: "text",   editable: false, width: "w-48" },
    { key: "category",     label: "Category",       type: "text",   editable: false },
    { key: "quantity",     label: "Stock Qty",      type: "number", editable: false, width: "w-24" },
    { key: "unit",         label: "Unit",           type: "text",   editable: false },
    { key: "minThreshold", label: "Min Level",      type: "number", editable: true  },
    { key: "location",     label: "Bin / Location", type: "text",   editable: true  },
    { key: "supplier",     label: "Supplier",       type: "text",   editable: true  },
    { key: "status",       label: "Status",         type: "status", editable: false },
  ],
  fuelMaintenance: [
    { key: "vehicleInfo",  label: "Vehicle",    type: "text",     editable: false, width: "w-40" },
    { key: "date",         label: "Date",       type: "date",     editable: false },
    { key: "liters",       label: "Liters",     type: "number",   editable: false },
    { key: "totalCost",    label: "Total Cost", type: "currency", editable: false },
    { key: "driver",       label: "Driver",     type: "text",     editable: false },
    { key: "station",      label: "Station",    type: "text",     editable: false },
  ],
};

// ─── API endpoints per subcard ──────────────────────────────────────────────

const API: Record<string, string> = {
  officeSupplies:       "/api/admin/inventory/items",
  maintenanceSupplies:  "/api/admin/office-admin/maintenance-supplies",
  medicalSupplies:      "/api/admin/office-admin/medical-supplies",
  stockroom:            "/api/admin/office-admin/stockroom",
  fuelMaintenance:      "/api/admin/office-admin/fuel-maintenance",
};

// ─── Types ──────────────────────────────────────────────────────────────────

type SubcardKey = "officeSupplies" | "maintenanceSupplies" | "medicalSupplies" | "stockroom" | "fuelMaintenance";
type WorkflowType = "STOCK_IN";

interface Row extends Record<string, unknown> {
  id: string;
  name?: string;
  vehicleInfo?: string;
}

interface Kpi { total: number; lowStock: number; outOfStock: number; }
interface LogEntry { id: string; action: string; detail: string | null; createdAt: string; }

interface WorkflowState {
  open: boolean;
  type: WorkflowType;
  row: Row | null;
}

// ─── Subcard tabs config ─────────────────────────────────────────────────────

const TABS = [
  { key: "officeSupplies"       as SubcardKey, label: "Office Supplies",      icon: Package,  accent: "text-blue-600",    bg: "bg-blue-600"   },
  { key: "maintenanceSupplies"  as SubcardKey, label: "Maintenance",           icon: Wrench,   accent: "text-amber-600",   bg: "bg-amber-600"  },
  { key: "medicalSupplies"      as SubcardKey, label: "Medical",               icon: Pill,     accent: "text-rose-600",    bg: "bg-rose-600"   },
  { key: "stockroom"            as SubcardKey, label: "Stockroom",             icon: Archive,  accent: "text-slate-600",   bg: "bg-slate-600"  },
  { key: "fuelMaintenance"      as SubcardKey, label: "Fuel & Maintenance",    icon: Fuel,     accent: "text-emerald-600", bg: "bg-emerald-600"},
] as const;

// ─── createTransaction helper ────────────────────────────────────────────────

async function createTransaction(payload: {
  subcard: string;
  type: "UPDATE_CELL" | "STOCK_IN" | "STOCK_OUT" | "STOCK_ADJUST";
  payload: Record<string, unknown>;
}) {
  const res  = await fetch("/api/admin/office-admin/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── createWorkflow helper ───────────────────────────────────────────────────

async function createWorkflow(payload: {
  subcard: string;
  type: string;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  note?: string;
}) {
  const res  = await fetch("/api/admin/office-admin/workflows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ─── WorkflowDrawer ──────────────────────────────────────────────────────────

function WorkflowDrawer({
  state, subcard, onClose, onDone,
}: {
  state: WorkflowState;
  subcard: SubcardKey;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [qty, setQty]   = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (state.open) { setQty(""); setNote(""); } }, [state.open]);

  if (!state.open || !state.row) return null;

  const LABELS: Record<WorkflowType, string> = {
    STOCK_IN: "Add Stock",
  };
  const ACCENTS: Record<WorkflowType, string> = {
    STOCK_IN: "bg-emerald-600",
  };

  const title  = LABELS[state.type];
  const accent = ACCENTS[state.type];
  const itemLabel = String(state.row.name ?? state.row.vehicleInfo ?? "");

  const handleSubmit = async () => {
    if (!qty) return;
    setSaving(true);
    try {
      const itemId = state.row!.id;
      // Step 1 — persist via transaction engine
      const txRes = await createTransaction({
        subcard,
        type: state.type,
        payload: { id: itemId, quantity: parseFloat(qty), note: note || null },
      });
      if (!txRes.success) throw new Error(txRes.error);

      // Step 2 — record workflow
      await createWorkflow({
        subcard,
        type: state.type,
        itemId,
        itemName: itemLabel,
        quantity: parseFloat(qty),
        note: note || undefined,
      });

      onDone(`${title}: ${qty} × ${itemLabel}${note ? ` — ${note}` : ""}`);
      onClose();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        <div className={`${accent} px-5 py-4 text-white shrink-0`}>
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="text-base font-bold">{title}</h2>
            <button onClick={onClose}><X className="h-4 w-4 text-white/70 hover:text-white" /></button>
          </div>
          <p className="text-xs text-white/70 truncate">{itemLabel}</p>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
            <input
              autoFocus type="number" min="0.01" step="any" placeholder="0"
              value={qty} onChange={(e) => setQty(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note / Reason</label>
            <textarea
              rows={3} placeholder="Optional note..."
              value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 space-y-2 shrink-0">
          <button
            onClick={handleSubmit} disabled={!qty || saving}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white ${accent} hover:opacity-90 disabled:opacity-40`}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Submit"}
          </button>
          <button onClick={onClose} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
        </div>
      </div>
    </>
  );
}

// ─── LogsPanel ───────────────────────────────────────────────────────────────

function LogsPanel({ logs }: { logs: { msg: string; time: string }[] }) {
  if (!logs.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Activity Log</h3>
      <ul className="space-y-1.5 max-h-48 overflow-y-auto">
        {logs.map((l, i) => (
          <li key={i} className="flex items-start justify-between gap-4 text-xs">
            <span className="text-slate-600">{l.msg}</span>
            <span className="text-slate-400 tabular-nums shrink-0">{l.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Supply Requests Queue (admin view) ─────────────────────────────────────

interface SupplyRequest {
  id:              string;
  itemName:        string;
  quantity:        number;
  unit:            string;
  purpose:         string;
  status:          string;
  requesterName:   string;
  requesterEmail:  string;
  employeeNumber:  string;
  department:      string;
  createdAt:       string;
  approvedAt?:     string;
  completedAt?:    string;
  rejectedAt?:     string;
  rejectionReason?: string;
}

const REQ_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-700",  icon: <Clock        className="h-3.5 w-3.5" /> },
  APPROVED:  { label: "Approved",  bg: "bg-blue-50",   text: "text-blue-700",   icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  COMPLETED: { label: "Fulfilled", bg: "bg-green-50",  text: "text-green-700",  icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REJECTED:  { label: "Rejected",  bg: "bg-rose-50",   text: "text-rose-700",   icon: <XCircle      className="h-3.5 w-3.5" /> },
};

function timeAgoReq(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SupplyRequestsQueue() {
  const [requests, setRequests]       = useState<SupplyRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [expanded, setExpanded]       = useState<string | null>(null);
  const [acting, setActing]           = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectNote, setRejectNote]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/office-admin/supply-requests");
      const json = await res.json() as { success: boolean; data: SupplyRequest[] };
      if (json.success) setRequests(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function act(id: string, action: "APPROVE" | "REJECT" | "COMPLETE", note?: string) {
    setActing(id);
    try {
      const res  = await fetch("/api/admin/office-admin/supply-requests", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id, action, note: note ?? null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      void load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(null);
      setRejectModal(null);
      setRejectNote("");
    }
  }

  const displayed = requests.filter((r) => !statusFilter || r.status === statusFilter);
  const counts = {
    PENDING:   requests.filter((r) => r.status === "PENDING").length,
    APPROVED:  requests.filter((r) => r.status === "APPROVED").length,
    COMPLETED: requests.filter((r) => r.status === "COMPLETED").length,
    REJECTED:  requests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {(["PENDING", "APPROVED", "COMPLETED", "REJECTED"] as const).map((s) => {
          const sc = REQ_STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`rounded-xl p-3 text-center border transition-all ${
                statusFilter === s
                  ? `${sc.bg} border-current ${sc.text} shadow-sm`
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className={`text-2xl font-bold ${statusFilter === s ? sc.text : "text-slate-800"}`}>{counts[s]}</div>
              <div className={`text-xs mt-0.5 ${statusFilter === s ? sc.text : "text-slate-500"}`}>{sc.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
            !statusFilter ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
          }`}
        >
          All ({requests.length})
        </button>
        <button
          onClick={load}
          className="ml-auto p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Request list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
            <Inbox className="h-10 w-10 opacity-30" />
            <p className="text-sm">No {statusFilter.toLowerCase() || ""} requests</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {displayed.map((req) => {
              const sc     = REQ_STATUS_CONFIG[req.status] ?? REQ_STATUS_CONFIG.PENDING;
              const isOpen = expanded === req.id;
              const busy   = acting === req.id;

              return (
                <li key={req.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : req.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <ShoppingBag className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {req.itemName}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">
                          ×{req.quantity} {req.unit}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {req.requesterName} · {req.department || "No dept"} · {req.employeeNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                        {sc.icon} {sc.label}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgoReq(req.createdAt)}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100 space-y-4">
                      {/* Details */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 pt-3">
                        <div><span className="font-medium">Item:</span> {req.itemName}</div>
                        <div><span className="font-medium">Qty:</span> {req.quantity} {req.unit}</div>
                        <div><span className="font-medium">Requester:</span> {req.requesterName}</div>
                        <div><span className="font-medium">Dept:</span> {req.department || "—"}</div>
                        <div className="col-span-2"><span className="font-medium">Purpose:</span> {req.purpose}</div>
                        <div><span className="font-medium">Submitted:</span> {new Date(req.createdAt).toLocaleString("en-PH")}</div>
                        {req.rejectionReason && (
                          <div className="col-span-2 flex items-start gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-2 mt-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{req.rejectionReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {req.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => act(req.id, "APPROVE")}
                            disabled={busy}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: req.id }); setExpanded(null); }}
                            disabled={busy}
                            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}

                      {req.status === "APPROVED" && (
                        <button
                          onClick={() => act(req.id, "COMPLETE")}
                          disabled={busy}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Mark as Issued
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-800">Reject Request</h3>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reason (optional)</label>
                <textarea
                  autoFocus
                  rows={3}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Explain why the request is being rejected…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setRejectModal(null); setRejectNote(""); }}
                  className="flex-1 border border-slate-200 text-slate-600 text-sm py-2 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => act(rejectModal.id, "REJECT", rejectNote)}
                  disabled={!!acting}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [viewMode, setViewMode]         = useState<"inventory" | "requests">("inventory");
  const [activeTab, setActiveTab]       = useState<SubcardKey>("officeSupplies");
  const [rows, setRows]                 = useState<Row[]>([]);
  const [kpis, setKpis]                 = useState<Kpi>({ total: 0, lowStock: 0, outOfStock: 0 });
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [workflow, setWorkflow]         = useState<WorkflowState>({ open: false, type: "STOCK_IN", row: null });
  const [sessionLogs, setSessionLogs]   = useState<{ msg: string; time: string }[]>([]);
  const [rtStatus, setRtStatus]         = useState<"connecting" | "live" | "off">("off");
  const esRef = useRef<EventSource | null>(null);

  // ── push session log ───────────────────────────────────────────────────

  const pushLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
    setSessionLogs((prev) => [{ msg, time }, ...prev].slice(0, 60));
  }, []);

  // ── load data ──────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res  = await fetch(`${API[activeTab]}?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      let items: Row[] = [];
      if (activeTab === "officeSupplies") {
        items = (json.data.data ?? json.data ?? []) as Row[];
      } else if (activeTab === "fuelMaintenance") {
        items = (json.data.fuelLogs ?? []) as Row[];
      } else {
        items = (json.data.items ?? json.data ?? []) as Row[];
      }
      setRows(items);

      if (activeTab !== "fuelMaintenance") {
        const stockKey = activeTab === "officeSupplies" ? "totalStock" : "quantity";
        const minKey   = activeTab === "stockroom" ? "minThreshold" : activeTab === "officeSupplies" ? "minThreshold" : "reorderLevel";
        const low = items.filter((i) => { const q = Number(i[stockKey]), m = Number(i[minKey]); return q > 0 && m > 0 && q <= m; }).length;
        const out = items.filter((i) => Number(i[stockKey]) === 0).length;
        setKpis({ total: items.length, lowStock: low, outOfStock: out });
      } else {
        setKpis({ total: (json.data.kpis?.totalVehicles ?? 0), lowStock: 0, outOfStock: 0 });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { load(); }, [load]);

  // ── SSE real-time ──────────────────────────────────────────────────────

  useEffect(() => {
    esRef.current?.close();
    setRtStatus("connecting");
    const es = new EventSource(`/api/admin/office-admin/stream?subcard=${activeTab}`);
    esRef.current = es;

    es.onopen = () => setRtStatus("live");
    es.onerror = () => setRtStatus("off");
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        pushLog(`[RT] ${event.type} on ${event.subcard}`);
        load();
      } catch {}
    };

    return () => { es.close(); setRtStatus("off"); };
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── cell commit → createTransaction ───────────────────────────────────

  const handleCellCommit = useCallback(async (
    _rowIndex: number, colKey: string, value: unknown, row: Row
  ) => {
    try {
      const res = await createTransaction({
        subcard: activeTab,
        type: "UPDATE_CELL",
        payload: { id: row.id, colKey, value },
      });
      if (!res.success) throw new Error(res.error);
      const label = String(row.name ?? row.vehicleInfo ?? row.id);
      pushLog(`Updated ${colKey} on "${label}" → ${value}`);
    } catch (e) {
      pushLog(`Error: ${e instanceof Error ? e.message : "update failed"}`);
    }
  }, [activeTab, pushLog]);

  // ── delete ─────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    const item = rows.find((r) => r.id === id);
    try {
      const res  = await fetch(`${API[activeTab]}?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      pushLog(`Deleted "${String(item?.name ?? id)}"`);
      setDeleteId(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  // ── workflow done ──────────────────────────────────────────────────────

  const handleWorkflowDone = (msg: string) => {
    pushLog(msg);
    load();
  };

  const tab = TABS.find((t) => t.key === activeTab)!;
  const isFuel = activeTab === "fuelMaintenance";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">All office inventory — inline editable, real-time sync</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Real-time indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
            rtStatus === "live" ? "bg-emerald-50 text-emerald-600" :
            rtStatus === "connecting" ? "bg-amber-50 text-amber-600" :
            "bg-slate-100 text-slate-400"
          }`}>
            {rtStatus === "live" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {rtStatus === "live" ? "Live" : rtStatus === "connecting" ? "Connecting…" : "Offline"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
        {TABS.map((t) => {
          const active = viewMode === "inventory" && t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => { setViewMode("inventory"); setActiveTab(t.key); setSearch(""); setDeleteId(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? `bg-slate-800 text-white shadow-sm`
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <t.icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-white" : t.accent}`} />
              {t.label}
            </button>
          );
        })}
        {/* Requests tab */}
        <button
          onClick={() => setViewMode("requests")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            viewMode === "requests"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
          Requests
        </button>
      </div>

      {/* Supply Requests view */}
      {viewMode === "requests" && <SupplyRequestsQueue />}

      {/* Inventory grid view */}
      {viewMode === "inventory" && !isFuel && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Items",  value: kpis.total,      icon: <tab.icon className={`h-4 w-4 ${tab.accent}`} />, cls: "" },
            { label: "Low Stock",    value: kpis.lowStock,   icon: <TrendingDown className="h-4 w-4 text-amber-500" />, cls: kpis.lowStock > 0 ? "border-amber-200" : "" },
            { label: "Out of Stock", value: kpis.outOfStock, icon: <AlertTriangle className="h-4 w-4 text-red-500" />,  cls: kpis.outOfStock > 0 ? "border-red-200" : "" },
          ].map((k) => (
            <div key={k.label} className={`bg-white border rounded-xl p-4 ${k.cls || "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-1"><p className="text-xs text-slate-500">{k.label}</p>{k.icon}</div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {viewMode === "inventory" && (
        <>
          {/* Action bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-40 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!isFuel && (
              <button
                onClick={() => {
                  if (rows.length) setWorkflow({ open: true, type: "STOCK_IN", row: rows[0] });
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" /> Add Stock
              </button>
            )}
            <button onClick={load} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

          {/* Hint */}
          {!isFuel && !loading && rows.length > 0 && (
            <p className="text-[10px] text-slate-400">
              Double-click or press F2 on a <span className="text-blue-500">✎ editable</span> cell to edit.
              Arrow keys navigate. Shift+click for range. Ctrl+C / Ctrl+V for copy/paste. Ctrl+Z to undo.
            </p>
          )}

          {/* Excel Grid */}
          <ExcelGrid
            data={rows}
            columns={COLUMNS[activeTab]}
            loading={loading}
            emptyMessage={`No ${tab.label.toLowerCase()} found`}
            onCellCommit={isFuel ? undefined : handleCellCommit}
            renderActions={(row, _rowIndex) => (
              <div className="flex items-center gap-1">
                {!isFuel && (
                  <button
                    onClick={() => setWorkflow({ open: true, type: "STOCK_IN", row })}
                    title="Add Stock"
                    className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50"
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" />
                  </button>
                )}
                {deleteId === row.id ? (
                  <>
                    <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded text-red-600 hover:bg-red-50"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteId(null)}    className="p-1.5 rounded text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                  </>
                ) : (
                  <button onClick={() => setDeleteId(row.id)} title="Delete" className="p-1.5 rounded text-red-400 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          />

          {/* Workflow Drawer */}
          <WorkflowDrawer
            state={workflow}
            subcard={activeTab}
            onClose={() => setWorkflow((s) => ({ ...s, open: false }))}
            onDone={handleWorkflowDone}
          />

          {/* Session Activity Log */}
          <LogsPanel logs={sessionLogs} />
        </>
      )}
    </div>
  );
}
