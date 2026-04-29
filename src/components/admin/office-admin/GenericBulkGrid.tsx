"use client";

/**
 * GenericBulkGrid — reusable Excel-like bulk data entry grid.
 *
 * Keyboard:
 *   Tab / Shift+Tab  — right / left within row
 *   Enter / ArrowDown — down to same column next row (auto-appends at bottom)
 *   ArrowUp          — up
 *   Ctrl+Enter       — save
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BulkColType = "text" | "number" | "select" | "date";

export interface BulkColDef {
  key:       string;
  label:     string;
  type?:     BulkColType;
  required?: boolean;
  width?:    string;
  options?:  { value: string; label: string }[];
  default?:  string;
  placeholder?: string;
}

type BulkRow = Record<string, string> & { _id: string };

interface GenericBulkGridProps {
  columns:   BulkColDef[];
  /** Called with valid rows on save. Should POST to your API and resolve. */
  onSave:    (rows: Record<string, string>[]) => Promise<void>;
  onCancel:  () => void;
  title?:    string;
  initialRows?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyRow(cols: BulkColDef[]): BulkRow {
  const row: BulkRow = { _id: createId() };
  for (const c of cols) row[c.key] = c.default ?? "";
  return row;
}

function makeRows(n: number, cols: BulkColDef[]): BulkRow[] {
  return Array.from({ length: n }, () => emptyRow(cols));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GenericBulkGrid({ columns, onSave, onCancel, title, initialRows = 10 }: GenericBulkGridProps) {
  const [rows, setRows]     = useState<BulkRow[]>(() => makeRows(initialRows, columns));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [saved, setSaved]   = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);
  const COL_COUNT = columns.length;

  const focusCell = useCallback((r: number, c: number) => {
    setTimeout(() => inputRefs.current[r]?.[c]?.focus(), 0);
  }, []);

  const appendRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow(columns)]);
  }, [columns]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
      if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); return; }

      if (e.key === "Tab") {
        e.preventDefault();
        if (!e.shiftKey) {
          if (colIdx < COL_COUNT - 1) focusCell(rowIdx, colIdx + 1);
          else if (rowIdx < rows.length - 1) focusCell(rowIdx + 1, 0);
          else { appendRow(); focusCell(rowIdx + 1, 0); }
        } else {
          if (colIdx > 0) focusCell(rowIdx, colIdx - 1);
          else if (rowIdx > 0) focusCell(rowIdx - 1, COL_COUNT - 1);
        }
      } else if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        if (rowIdx < rows.length - 1) focusCell(rowIdx + 1, colIdx);
        else { appendRow(); focusCell(rowIdx + 1, colIdx); }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (rowIdx > 0) focusCell(rowIdx - 1, colIdx);
      }
    },
    [COL_COUNT, rows.length, focusCell, appendRow],
  );

  const setCell = (rowIdx: number, key: string, val: string) => {
    setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [key]: val } : r)));
  };

  const deleteRow = (rowIdx: number) => {
    setRows((prev) => {
      if (prev.length === 1) return [emptyRow(columns)];
      return prev.filter((_, i) => i !== rowIdx);
    });
  };

  const handleSave = async () => {
    setError(null);
    const valid = rows.filter((r) => columns.some((c) => c.required && r[c.key]?.trim()));
    if (valid.length === 0) { setError("Please fill in at least one row."); return; }

    // Validate required fields
    for (let i = 0; i < valid.length; i++) {
      for (const col of columns) {
        if (col.required && !valid[i][col.key]?.trim()) {
          setError(`Row ${rows.indexOf(valid[i]) + 1}: "${col.label}" is required.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      // Strip _id before passing to parent
      const payload = valid.map(({ _id: _, ...rest }) => rest);
      await onSave(payload);
      setSaved(valid.length);
      setRows(makeRows(initialRows, columns));
      setTimeout(() => setSaved(0), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const validCount = rows.filter((r) => columns.some((c) => c.required && r[c.key]?.trim())).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{title ?? "Bulk Entry"}</span>
          {validCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{validCount} rows ready</span>
          )}
          {saved > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">✓ Saved {saved} rows</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRows((p) => [...p, ...makeRows(5, columns)])}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" /> Add 5 Rows
          </button>
          <button
            onClick={handleSave}
            disabled={saving || validCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
          <button onClick={onCancel} className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-xs text-red-700">{error}</div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="w-8 px-2 py-2 text-center text-[10px] text-slate-400 border-r border-slate-100">#</th>
              {columns.map((col) => (
                <th key={col.key} className={`px-2 py-2 text-left text-xs font-semibold text-slate-600 border-r border-slate-100 ${col.width ?? ""}`}>
                  {col.label}{col.required && <span className="text-red-400 ml-0.5">*</span>}
                </th>
              ))}
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row, rowIdx) => {
              if (!inputRefs.current[rowIdx]) inputRefs.current[rowIdx] = [];
              return (
                <tr key={row._id} className="hover:bg-blue-50/30 group">
                  <td className="w-8 px-2 py-1 text-center text-[10px] text-slate-300 border-r border-slate-100 font-mono">{rowIdx + 1}</td>
                  {columns.map((col, colIdx) => (
                    <td key={col.key} className="px-1 py-0.5 border-r border-slate-100">
                      {col.type === "select" && col.options ? (
                        <select
                          ref={(el) => { inputRefs.current[rowIdx][colIdx] = el; }}
                          value={row[col.key]}
                          onChange={(e) => setCell(rowIdx, col.key, e.target.value)}
                          onKeyDown={(e) => handleKey(e, rowIdx, colIdx)}
                          className="w-full h-7 px-1.5 text-xs border-0 outline-none focus:ring-1 focus:ring-blue-400 rounded bg-transparent focus:bg-white"
                        >
                          <option value="">—</option>
                          {col.options.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          ref={(el) => { inputRefs.current[rowIdx][colIdx] = el; }}
                          type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                          value={row[col.key]}
                          placeholder={col.placeholder ?? ""}
                          onChange={(e) => setCell(rowIdx, col.key, e.target.value)}
                          onKeyDown={(e) => handleKey(e, rowIdx, colIdx)}
                          className="w-full h-7 px-1.5 text-xs border-0 outline-none focus:ring-1 focus:ring-blue-400 rounded bg-transparent focus:bg-white"
                        />
                      )}
                    </td>
                  ))}
                  <td className="w-8 px-1 py-0.5 text-center">
                    <button
                      onClick={() => deleteRow(rowIdx)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {rows.length} rows · {validCount} with data · Tab/Enter to navigate · Ctrl+Enter to save
        </span>
        <button
          onClick={() => setRows((p) => [...p, ...makeRows(5, columns)])}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700"
        >
          <Plus className="h-3 w-3" /> 5 more rows
        </button>
      </div>
    </div>
  );
}
