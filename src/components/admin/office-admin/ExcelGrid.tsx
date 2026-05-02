"use client";

import { useRef, useEffect, useState } from "react";

import { useGridEngine, ColDef } from "./useGridEngine";

// ─── Status badge helper ────────────────────────────────────────────────────

function statusBadge(qty: number, min: number) {
  if (qty === 0)             return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">Out of Stock</span>;
  if (min > 0 && qty <= min) return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Low Stock</span>;
  return                           <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">In Stock</span>;
}

// ─── Cell editor ────────────────────────────────────────────────────────────

interface CellEditorProps {
  value: unknown;
  type: ColDef["type"];
  onCommit: (v: string) => void;
  onCancel: () => void;
}

function CellEditor({ value, type, onCommit, onCancel }: CellEditorProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [val, setVal] = useState(String(value ?? ""));

  useEffect(() => { ref.current?.select(); }, []);

  const commit = () => onCommit(val);

  return (
    <input
      ref={ref}
      type={type === "number" || type === "currency" ? "number" : type === "date" ? "date" : "text"}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); commit(); }
        if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        e.stopPropagation();
      }}
      className="w-full h-full px-2 py-1 text-sm border-0 outline-none ring-2 ring-inset ring-blue-500 bg-white rounded-sm"
      style={{ minWidth: 60 }}
    />
  );
}

// ─── Cell renderer ──────────────────────────────────────────────────────────

function renderCell(value: unknown, col: ColDef, row: Record<string, unknown>) {
  if (col.type === "status") {
    const qty = Number(row["totalStock"] ?? row["quantity"] ?? row["stock"] ?? 0);
    const min = Number(row["minThreshold"] ?? row["reorderLevel"] ?? 0);
    return statusBadge(qty, min);
  }
  if (col.type === "currency") {
    return <span className="tabular-nums">₱{Number(value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>;
  }
  if (col.type === "date" && value) {
    return <span>{new Date(String(value)).toLocaleDateString("en-PH")}</span>;
  }
  if (col.type === "number") {
    return <span className="tabular-nums">{String(value ?? 0)}</span>;
  }
  return <span>{
    value !== null && value !== undefined && typeof value === "object" && !Array.isArray(value)
      ? String((value as Record<string, unknown>).name ?? (value as Record<string, unknown>).label ?? "—")
      : String(value ?? "—")
  }</span>;
}

// ─── Props ──────────────────────────────────────────────────────────────────

export interface ExcelGridProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColDef[];
  /** Called after any cell is updated (for API persistence) */
  onCellCommit?: (rowIndex: number, colKey: string, value: unknown, row: T) => void;
  /** Extra action column render */
  renderActions?: (row: T, rowIndex: number) => React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ExcelGrid<T extends Record<string, unknown>>({
  data: externalData,
  columns,
  onCellCommit,
  renderActions,
  loading,
  emptyMessage = "No items found",
}: ExcelGridProps<T>) {
  const engine = useGridEngine<T>(externalData);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external data changes (e.g. after reload)
  const prevDataRef = useRef(externalData);
  useEffect(() => {
    if (externalData !== prevDataRef.current) {
      engine.setData(externalData);
      prevDataRef.current = externalData;
    }
  }, [externalData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCommit = (rowIndex: number, col: ColDef, rawValue: string) => {
    engine.commitEdit(rowIndex, col.key, rawValue, columns);
    const row = engine.data[rowIndex];
    let typed: unknown = rawValue;
    if (col.type === "number" || col.type === "currency") typed = parseFloat(rawValue) || 0;
    onCellCommit?.(rowIndex, col.key, typed, row);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Grid */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="bg-white border border-slate-200 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
        onKeyDown={(e) => {
          // Global clipboard shortcuts
          if ((e.ctrlKey || e.metaKey) && e.key === "c") { e.preventDefault(); engine.onCopy(columns); return; }
          if ((e.ctrlKey || e.metaKey) && e.key === "v") {
            e.preventDefault();
            engine.onPaste(columns, (r, k, v) => onCellCommit?.(r, k, v, engine.data[r]));
            return;
          }
          engine.onGridKeyDown(e, columns, engine.data.length);
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse select-none">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-8 px-2 py-3 text-center text-[10px] text-slate-400 font-medium border-r border-slate-100">#</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-slate-100 last:border-r-0 ${col.width ?? ""}`}
                  >
                    {col.label}
                    {col.editable && <span className="ml-1 text-blue-400 text-[9px]">✎</span>}
                  </th>
                ))}
                {renderActions && (
                  <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {engine.data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 2 : 1)} className="px-4 py-12 text-center text-sm text-slate-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                engine.data.map((row, rowIndex) => (
                  <tr
                    key={(row.id as string) ?? rowIndex}
                    className={engine.isSelected(rowIndex, 0) || [...engine.selectedCells].some((k) => parseInt(k) === rowIndex) ? "" : "hover:bg-slate-50/50"}
                  >
                    {/* Row number */}
                    <td className="w-8 px-2 py-2 text-center text-[10px] text-slate-300 border-r border-slate-100 font-mono">{rowIndex + 1}</td>

                    {/* Data cells */}
                    {columns.map((col, colIndex) => {
                      const isEditing = engine.editingCell?.row === rowIndex && engine.editingCell?.col === colIndex;
                      const isActive  = engine.isActive(rowIndex, colIndex);
                      const isSel     = engine.isSelected(rowIndex, colIndex);
                      const value     = row[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`
                            px-3 py-2 border-r border-slate-100 last:border-r-0 relative cursor-default
                            ${isSel && !isEditing ? "bg-blue-50" : ""}
                            ${isActive && !isEditing ? "outline outline-2 outline-blue-400 outline-offset-[-1px] z-10" : ""}
                            ${col.editable ? "cursor-cell" : ""}
                          `}
                          onMouseDown={(e) => engine.onCellMouseDown(rowIndex, colIndex, e)}
                          onMouseEnter={(e) => engine.onCellMouseEnter(rowIndex, colIndex, e)}
                          onDoubleClick={() => col.editable && engine.startEdit(rowIndex, colIndex)}
                        >
                          {isEditing ? (
                            <CellEditor
                              value={value}
                              type={col.type}
                              onCommit={(v) => handleCommit(rowIndex, col, v)}
                              onCancel={engine.cancelEdit}
                            />
                          ) : (
                            <div className="text-sm">
                              {renderCell(value, col, row)}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    {renderActions && (
                      <td className="px-3 py-2">
                        {renderActions(row, rowIndex)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
