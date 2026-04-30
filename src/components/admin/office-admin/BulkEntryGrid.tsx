"use client";

/**
 * BulkEntryGrid — Excel-like data entry for adding inventory items in bulk.
 *
 * Keyboard behaviour:
 *   Tab / Shift+Tab  — move right / left within a row
 *   Enter            — move down to the same column in the next row
 *   ArrowUp/Down     — move vertically
 *   ArrowLeft/Right  — move horizontally
 *   Tab on last cell of last row → auto-appends a new row and focuses it
 *   Escape           — cancel / clear current cell
 *   Ctrl+Enter       — save all rows
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createId } from "@paralleldrive/cuid2";
import { Loader2, Plus, Save, X, Trash2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category { id: string; name: string; }

interface BulkRow {
  _id:          string;
  name:         string;
  categoryId:   string;
  quantity:     string;
  unit:         string;
  minThreshold: string;
  location:     string;
}

interface BulkEntryGridProps {
  onSaved:    () => void;
  onCancel:   () => void;
}

// ─── Column definitions ──────────────────────────────────────────────────────

const COLS: { key: keyof Omit<BulkRow, "_id">; label: string; required?: boolean; type?: "number" | "select" | "text"; width: string }[] = [
  { key: "name",         label: "Item Name",  required: true,  type: "text",   width: "min-w-[200px]"  },
  { key: "categoryId",   label: "Category",   required: false, type: "select", width: "min-w-[140px]"  },
  { key: "quantity",     label: "Qty",        required: false, type: "number", width: "min-w-[80px]"   },
  { key: "unit",         label: "Unit",       required: false, type: "text",   width: "min-w-[80px]"   },
  { key: "minThreshold", label: "Min Level",  required: false, type: "number", width: "min-w-[90px]"   },
  { key: "location",     label: "Location",   required: false, type: "text",   width: "min-w-[140px]"  },
];

const COL_COUNT = COLS.length;
const INITIAL_ROWS = 10;

function emptyRow(): BulkRow {
  return { _id: createId(), name: "", categoryId: "", quantity: "", unit: "pcs", minThreshold: "", location: "" };
}

function makeRows(n: number): BulkRow[] {
  return Array.from({ length: n }, emptyRow);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BulkEntryGrid({ onSaved, onCancel }: BulkEntryGridProps) {
  const [rows, setRows]           = useState<BulkRow[]>(makeRows(INITIAL_ROWS));
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState<number>(0);

  // inputRefs[rowIdx][colIdx]
  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | null)[][]>([]);

  // ── Load categories ────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/admin/inventory/categories")
      .then((r) => r.json())
      .then((j) => { if (j.success) setCategories(j.data as Category[]); })
      .catch(() => {});
  }, []);

  // ── Ensure refs array is sized correctly ───────────────────────────────────

  useEffect(() => {
    inputRefs.current = rows.map((_, ri) =>
      COLS.map((_, ci) => inputRefs.current[ri]?.[ci] ?? null)
    );
  }, [rows.length]);

  // ── Focus helper ──────────────────────────────────────────────────────────

  const focusCell = useCallback((row: number, col: number) => {
    const el = inputRefs.current[row]?.[col];
    if (el) { el.focus(); (el as HTMLInputElement).select?.(); }
  }, []);

  // ── Keyboard handler ──────────────────────────────────────────────────────

  const onKeyDown = useCallback((e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    const isLastRow = rowIdx === rows.length - 1;
    const isLastCol = colIdx === COL_COUNT - 1;
    const isFirstCol = colIdx === 0;

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (isLastCol) {
        if (isLastRow) {
          // append new row and move to its first cell
          setRows((prev) => {
            const next = [...prev, emptyRow()];
            setTimeout(() => focusCell(next.length - 1, 0), 0);
            return next;
          });
        } else {
          focusCell(rowIdx + 1, 0);
        }
      } else {
        focusCell(rowIdx, colIdx + 1);
      }
      return;
    }

    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (isFirstCol) {
        if (rowIdx > 0) focusCell(rowIdx - 1, COL_COUNT - 1);
      } else {
        focusCell(rowIdx, colIdx - 1);
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (isLastRow) {
        setRows((prev) => {
          const next = [...prev, emptyRow()];
          setTimeout(() => focusCell(next.length - 1, colIdx), 0);
          return next;
        });
      } else {
        focusCell(rowIdx + 1, colIdx);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isLastRow) {
        setRows((prev) => {
          const next = [...prev, emptyRow()];
          setTimeout(() => focusCell(next.length - 1, colIdx), 0);
          return next;
        });
      } else {
        focusCell(rowIdx + 1, colIdx);
      }
      return;
    }

    if (e.key === "ArrowUp" && rowIdx > 0) {
      e.preventDefault();
      focusCell(rowIdx - 1, colIdx);
      return;
    }

    if (e.key === "ArrowRight" && !isLastCol) {
      const el = inputRefs.current[rowIdx]?.[colIdx] as HTMLInputElement | null;
      if (el && el.selectionStart === el.value.length) {
        e.preventDefault();
        focusCell(rowIdx, colIdx + 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && !isFirstCol) {
      const el = inputRefs.current[rowIdx]?.[colIdx] as HTMLInputElement | null;
      if (el && el.selectionStart === 0) {
        e.preventDefault();
        focusCell(rowIdx, colIdx - 1);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void handleSave();
      return;
    }
  }, [rows.length, focusCell]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update cell ───────────────────────────────────────────────────────────

  const updateCell = useCallback((rowIdx: number, key: keyof Omit<BulkRow, "_id">, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [key]: value };
      return next;
    });
  }, []);

  // ── Delete row ────────────────────────────────────────────────────────────

  const deleteRow = useCallback((rowIdx: number) => {
    setRows((prev) => {
      if (prev.length === 1) return makeRows(1);
      return prev.filter((_, i) => i !== rowIdx);
    });
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const validRows = rows.filter((r) => r.name.trim().length > 0);
    if (!validRows.length) { setError("Enter at least one item name."); return; }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        rows: validRows.map((r) => ({
          name:         r.name.trim(),
          categoryId:   r.categoryId || undefined,
          quantity:     parseFloat(r.quantity) || 0,
          unit:         r.unit.trim() || "pcs",
          minThreshold: parseFloat(r.minThreshold) || 0,
          location:     r.location.trim() || undefined,
        })),
      };

      const res  = await fetch("/api/admin/inventory/bulk", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");

      setSaved(validRows.length);
      setRows(makeRows(INITIAL_ROWS));
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const validCount = rows.filter((r) => r.name.trim().length > 0).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white">
        <div>
          <h3 className="text-sm font-semibold">Add Stock</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tab / Enter to move between cells · ArrowKeys to navigate · Ctrl+Enter to save
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRows((p) => [...p, ...makeRows(5)])}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded border border-slate-600 hover:border-slate-400 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add 5 rows
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Saved flash */}
      {saved > 0 && (
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-medium border-b border-emerald-100">
          ✓ {saved} item{saved > 1 ? "s" : ""} saved successfully. Grid ready for more entries.
        </div>
      )}
      {error && (
        <div className="px-4 py-2 bg-rose-50 text-rose-700 text-xs border-b border-rose-100">{error}</div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-8 px-2 py-2 text-slate-400 font-medium text-center">#</th>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className={`${col.width} px-3 py-2 text-left text-slate-600 font-semibold border-r border-slate-100 last:border-r-0`}
                >
                  {col.label}
                  {col.required && <span className="text-rose-400 ml-0.5">*</span>}
                </th>
              ))}
              <th className="w-8 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const filled = row.name.trim().length > 0;
              return (
                <tr
                  key={row._id}
                  className={`border-b border-slate-100 transition-colors ${filled ? "bg-blue-50/40" : "hover:bg-slate-50/60"}`}
                >
                  <td className="w-8 text-center text-slate-300 select-none px-1">{ri + 1}</td>

                  {COLS.map((col, ci) => {
                    const value = row[col.key];
                    const isActive = false; // focus managed by browser

                    if (col.key === "categoryId") {
                      return (
                        <td key={col.key} className="border-r border-slate-100 p-0">
                          <select
                            ref={(el) => {
                              if (!inputRefs.current[ri]) inputRefs.current[ri] = [];
                              inputRefs.current[ri][ci] = el;
                            }}
                            value={value}
                            onChange={(e) => updateCell(ri, col.key, e.target.value)}
                            onKeyDown={(e) => onKeyDown(e, ri, ci)}
                            className="w-full h-8 px-2 bg-transparent border-0 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 text-xs text-slate-700 cursor-pointer"
                          >
                            <option value="">— none —</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className="border-r border-slate-100 p-0 last:border-r-0">
                        <input
                          ref={(el) => {
                            if (!inputRefs.current[ri]) inputRefs.current[ri] = [];
                            inputRefs.current[ri][ci] = el;
                          }}
                          type={col.type === "number" ? "number" : "text"}
                          min={col.type === "number" ? "0" : undefined}
                          step={col.type === "number" ? "any" : undefined}
                          value={value}
                          placeholder={col.required ? col.label : ""}
                          onChange={(e) => updateCell(ri, col.key, e.target.value)}
                          onKeyDown={(e) => onKeyDown(e, ri, ci)}
                          className={`w-full h-8 px-2 bg-transparent border-0 outline-none text-xs placeholder:text-slate-300
                            focus:ring-2 focus:ring-inset focus:ring-blue-400
                            ${col.required && filled === false ? "" : ""}
                            ${col.required ? "font-medium" : "text-slate-600"}
                          `}
                        />
                      </td>
                    );
                  })}

                  <td className="w-8 text-center">
                    <button
                      onClick={() => deleteRow(ri)}
                      className="p-1 text-slate-300 hover:text-rose-400 transition-colors"
                      tabIndex={-1}
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

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          {validCount > 0 ? (
            <span className="text-blue-600 font-medium">{validCount} item{validCount > 1 ? "s" : ""} ready to save</span>
          ) : (
            <span>Start typing item names above</span>
          )}
          {" · "}{rows.length} rows total
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || validCount === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving…" : `Save ${validCount > 0 ? validCount : ""} Item${validCount !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>

    </div>
  );
}
