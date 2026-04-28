import { useCallback, useReducer, useRef } from "react";

// ─── Column config ─────────────────────────────────────────────────────────

export type ColType = "text" | "number" | "date" | "currency" | "status" | "readonly";

export interface ColDef {
  key: string;
  label: string;
  type: ColType;
  editable?: boolean;
  width?: string;
}

// ─── Cell position ─────────────────────────────────────────────────────────

export interface CellPos { row: number; col: number; }

function posKey(p: CellPos) { return `${p.row}:${p.col}`; }

function rangeKeys(a: CellPos, b: CellPos): Set<string> {
  const keys = new Set<string>();
  const r1 = Math.min(a.row, b.row), r2 = Math.max(a.row, b.row);
  const c1 = Math.min(a.col, b.col), c2 = Math.max(a.col, b.col);
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) keys.add(`${r}:${c}`);
  return keys;
}

// ─── History (undo/redo) ────────────────────────────────────────────────────

interface HistoryEntry {
  rowIndex: number;
  colKey: string;
  oldValue: unknown;
  newValue: unknown;
}

// ─── State / Reducer ────────────────────────────────────────────────────────

interface GridState<T> {
  data: T[];
  past: HistoryEntry[][];
  future: HistoryEntry[][];
}

type GridAction<T> =
  | { type: "SET_DATA"; data: T[] }
  | { type: "UPDATE_CELL"; rowIndex: number; colKey: string; value: unknown }
  | { type: "UNDO" }
  | { type: "REDO" };

function gridReducer<T extends Record<string, unknown>>(
  state: GridState<T>,
  action: GridAction<T>
): GridState<T> {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: action.data, past: [], future: [] };

    case "UPDATE_CELL": {
      const { rowIndex, colKey, value } = action;
      const oldValue = state.data[rowIndex]?.[colKey];
      if (oldValue === value) return state;
      const newData = state.data.map((row, i) =>
        i === rowIndex ? { ...row, [colKey]: value } : row
      );
      const entry: HistoryEntry = { rowIndex, colKey, oldValue, newValue: value };
      return {
        data: newData,
        past: [...state.past, [entry]],
        future: [],
      };
    }

    case "UNDO": {
      if (!state.past.length) return state;
      const last = state.past[state.past.length - 1];
      let newData = [...state.data];
      for (const e of last) {
        newData = newData.map((row, i) =>
          i === e.rowIndex ? { ...row, [e.colKey]: e.oldValue } : row
        );
      }
      return {
        data: newData,
        past: state.past.slice(0, -1),
        future: [last, ...state.future],
      };
    }

    case "REDO": {
      if (!state.future.length) return state;
      const next = state.future[0];
      let newData = [...state.data];
      for (const e of next) {
        newData = newData.map((row, i) =>
          i === e.rowIndex ? { ...row, [e.colKey]: e.newValue } : row
        );
      }
      return {
        data: newData,
        past: [...state.past, next],
        future: state.future.slice(1),
      };
    }

    default: return state;
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export interface GridEngine<T> {
  data: T[];
  setData: (data: T[]) => void;
  updateCell: (rowIndex: number, colKey: string, value: unknown) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Selection
  selectedCells: Set<string>;
  activeCell: CellPos | null;
  anchorCell: CellPos | null;
  isSelected: (row: number, col: number) => boolean;
  isActive: (row: number, col: number) => boolean;

  // Editing
  editingCell: CellPos | null;
  startEdit: (row: number, col: number) => void;
  commitEdit: (row: number, colKey: string, value: string, columns: ColDef[]) => void;
  cancelEdit: () => void;

  // Event handlers
  onCellMouseDown: (row: number, col: number, e: React.MouseEvent) => void;
  onCellMouseEnter: (row: number, col: number, e: React.MouseEvent) => void;
  onGridKeyDown: (e: React.KeyboardEvent, columns: ColDef[], rowCount: number) => void;
  onCopy: (columns: ColDef[]) => void;
  onPaste: (columns: ColDef[], onCellUpdate?: (rowIndex: number, colKey: string, value: unknown) => void) => void;
}

export function useGridEngine<T extends Record<string, unknown>>(
  initialData: T[] = []
): GridEngine<T> {
  const [state, dispatch] = useReducer(
    gridReducer as (s: GridState<T>, a: GridAction<T>) => GridState<T>,
    { data: initialData, past: [], future: [] }
  );

  // Selection state (not in reducer — no history needed)
  const activeRef   = useRef<CellPos | null>(null);
  const anchorRef   = useRef<CellPos | null>(null);
  const selectedRef = useRef<Set<string>>(new Set());
  const editingRef  = useRef<CellPos | null>(null);
  const [, forceRender] = useReducer((n) => n + 1, 0);

  const setActive = (pos: CellPos | null) => { activeRef.current = pos; };
  const setAnchor = (pos: CellPos | null) => { anchorRef.current = pos; };
  const setSelected = (s: Set<string>) => { selectedRef.current = s; forceRender(); };
  const setEditing = (pos: CellPos | null) => { editingRef.current = pos; forceRender(); };

  // ── Selection helpers ──────────────────────────────────────────────────

  const selectSingle = useCallback((row: number, col: number) => {
    setActive({ row, col });
    setAnchor({ row, col });
    setSelected(new Set([posKey({ row, col })]));
  }, []);

  const extendSelection = useCallback((row: number, col: number) => {
    if (!anchorRef.current) return;
    setActive({ row, col });
    setSelected(rangeKeys(anchorRef.current, { row, col }));
    forceRender();
  }, []);

  // ── Editing ────────────────────────────────────────────────────────────

  const startEdit = useCallback((row: number, col: number) => {
    setEditing({ row, col });
  }, []);

  const commitEdit = useCallback((
    row: number, colKey: string, raw: string, columns: ColDef[]
  ) => {
    const col = columns.find((c) => c.key === colKey);
    let value: unknown = raw;
    if (col?.type === "number" || col?.type === "currency") {
      value = raw === "" ? 0 : parseFloat(raw) || 0;
    }
    dispatch({ type: "UPDATE_CELL", rowIndex: row, colKey, value });
    setEditing(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────────────

  const onGridKeyDown = useCallback((
    e: React.KeyboardEvent, columns: ColDef[], rowCount: number
  ) => {
    const active = activeRef.current;
    if (!active) return;

    // Undo / Redo
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      dispatch({ type: "UNDO" });
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
      e.preventDefault();
      dispatch({ type: "REDO" });
      return;
    }

    const editingCol = columns[active.col];
    if (editingRef.current) return; // let input handle keys while editing

    const colCount = columns.length;

    switch (e.key) {
      case "ArrowDown":
      case "Enter": {
        e.preventDefault();
        const next = { row: Math.min(active.row + 1, rowCount - 1), col: active.col };
        if (e.shiftKey && e.key !== "Enter") extendSelection(next.row, next.col);
        else selectSingle(next.row, next.col);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const next = { row: Math.max(active.row - 1, 0), col: active.col };
        if (e.shiftKey) extendSelection(next.row, next.col);
        else selectSingle(next.row, next.col);
        break;
      }
      case "ArrowRight":
      case "Tab": {
        e.preventDefault();
        const next = { row: active.row, col: Math.min(active.col + 1, colCount - 1) };
        if (e.shiftKey && e.key !== "Tab") extendSelection(next.row, next.col);
        else selectSingle(next.row, next.col);
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        const next = { row: active.row, col: Math.max(active.col - 1, 0) };
        if (e.shiftKey) extendSelection(next.row, next.col);
        else selectSingle(next.row, next.col);
        break;
      }
      case "F2":
      case " ": {
        if (editingCol?.editable) {
          e.preventDefault();
          startEdit(active.row, active.col);
        }
        break;
      }
      case "Escape": {
        cancelEdit();
        break;
      }
      case "Delete":
      case "Backspace": {
        // Clear all selected editable cells
        for (const key of selectedRef.current) {
          const [r, c] = key.split(":").map(Number);
          const col = columns[c];
          if (col?.editable) {
            dispatch({ type: "UPDATE_CELL", rowIndex: r, colKey: col.key, value: col.type === "number" || col.type === "currency" ? 0 : "" });
          }
        }
        break;
      }
      default: {
        // Typing on an editable cell starts editing
        if (editingCol?.editable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          startEdit(active.row, active.col);
        }
      }
    }
  }, [selectSingle, extendSelection, startEdit, cancelEdit]);

  // ── Copy / Paste ────────────────────────────────────────────────────────

  const onCopy = useCallback((columns: ColDef[]) => {
    const selected = selectedRef.current;
    if (!selected.size) return;

    const rows = [...new Set([...selected].map((k) => parseInt(k.split(":")[0])))].sort((a, b) => a - b);
    const cols = [...new Set([...selected].map((k) => parseInt(k.split(":")[1])))].sort((a, b) => a - b);

    const tsv = rows.map((r) =>
      cols.map((c) => {
        if (!selected.has(posKey({ row: r, col: c }))) return "";
        const col = columns[c];
        return col ? String(state.data[r]?.[col.key] ?? "") : "";
      }).join("\t")
    ).join("\n");

    navigator.clipboard.writeText(tsv).catch(() => {});
  }, [state.data]);

  const onPaste = useCallback((
    columns: ColDef[],
    onCellUpdate?: (rowIndex: number, colKey: string, value: unknown) => void
  ) => {
    const active = activeRef.current;
    if (!active) return;

    navigator.clipboard.readText().then((text) => {
      const rows = text.split("\n").map((r) => r.split("\t"));
      for (let dr = 0; dr < rows.length; dr++) {
        for (let dc = 0; dc < rows[dr].length; dc++) {
          const r = active.row + dr;
          const c = active.col + dc;
          const col = columns[c];
          if (!col?.editable || r >= state.data.length) continue;
          let value: unknown = rows[dr][dc];
          if (col.type === "number" || col.type === "currency") value = parseFloat(String(value)) || 0;
          dispatch({ type: "UPDATE_CELL", rowIndex: r, colKey: col.key, value });
          onCellUpdate?.(r, col.key, value);
        }
      }
    }).catch(() => {});
  }, [state.data]);

  // ── Mouse handlers ─────────────────────────────────────────────────────

  const onCellMouseDown = useCallback((row: number, col: number, e: React.MouseEvent) => {
    if (e.shiftKey && anchorRef.current) {
      extendSelection(row, col);
    } else {
      selectSingle(row, col);
      if (e.detail === 2) {
        startEdit(row, col);
      }
    }
  }, [selectSingle, extendSelection, startEdit]);

  const onCellMouseEnter = useCallback((row: number, col: number, e: React.MouseEvent) => {
    if (e.buttons === 1 && anchorRef.current) {
      extendSelection(row, col);
    }
  }, [extendSelection]);

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    data: state.data,
    setData: (data: T[]) => dispatch({ type: "SET_DATA", data }),
    updateCell: (rowIndex, colKey, value) => dispatch({ type: "UPDATE_CELL", rowIndex, colKey, value }),
    undo: () => dispatch({ type: "UNDO" }),
    redo: () => dispatch({ type: "REDO" }),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,

    selectedCells: selectedRef.current,
    activeCell: activeRef.current,
    anchorCell: anchorRef.current,
    isSelected: (row, col) => selectedRef.current.has(posKey({ row, col })),
    isActive: (row, col) => activeRef.current?.row === row && activeRef.current?.col === col,

    editingCell: editingRef.current,
    startEdit,
    commitEdit,
    cancelEdit,

    onCellMouseDown,
    onCellMouseEnter,
    onGridKeyDown,
    onCopy,
    onPaste,
  };
}
