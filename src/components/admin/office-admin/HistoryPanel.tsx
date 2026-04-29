"use client";

import { useEffect, useState } from "react";
import { X, Clock, User, ChevronDown, ChevronRight } from "lucide-react";

interface HistoryEntry {
  id:         string;
  action:     string;
  targetType: string | null;
  targetId:   string | null;
  payload:    unknown;
  actorId:    string | null;
  actorName:  string;
  createdAt:  string;
}

interface HistoryPanelProps {
  targetId:   string;
  targetType: string;
  title?:     string;
  onClose:    () => void;
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    item_updated:      "Updated",
    item_deleted:      "Deleted",
    bulk_import:       "Bulk Import",
    stock_updated:     "Stock Updated",
    request_created:   "Request Created",
    request_approved:  "Request Approved",
    request_rejected:  "Request Rejected",
    request_completed: "Request Completed",
    UPDATE_CELL:       "Cell Edited",
    STOCK_IN:          "Stock In",
    STOCK_OUT:         "Stock Out",
    STOCK_ADJUST:      "Stock Adjusted",
  };
  return map[action] ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function actionColor(action: string): string {
  if (action.includes("delete"))   return "bg-red-100 text-red-700";
  if (action.includes("approved") || action.includes("completed") || action === "stock_updated") return "bg-emerald-100 text-emerald-700";
  if (action.includes("rejected")) return "bg-red-100 text-red-700";
  if (action.includes("created") || action.includes("import")) return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-600";
}

export function HistoryPanel({ targetId, targetType, title, onClose }: HistoryPanelProps) {
  const [entries, setEntries]   = useState<HistoryEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/office-admin/item-history?targetId=${targetId}&targetType=${targetType}`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setEntries(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetId, targetType]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-sm text-slate-800">{title ?? "Change History"}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No history found</div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${actionColor(e.action)}`}>
                      {actionLabel(e.action)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">{e.actorName}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(e.createdAt).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {!!e.payload && (
                    <button
                      onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                      className="shrink-0 p-1 rounded text-slate-400 hover:text-slate-600"
                    >
                      {expanded === e.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                  )}
                </div>
                {expanded === e.id && !!e.payload && (
                  <pre className="mt-2 text-[10px] bg-slate-50 border border-slate-200 rounded p-2 overflow-x-auto max-h-32 text-slate-600">
                    {JSON.stringify(e.payload as Record<string, unknown>, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
