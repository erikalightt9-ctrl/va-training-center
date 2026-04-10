"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2, AlertCircle, CheckCircle, XCircle, AlertTriangle, Clock,
  Upload, FileSpreadsheet, FileImage, FileText, X, Check,
  CloudUpload, RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number | null;
  overtimeHours: number | null;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    position: string;
    department: string | null;
  };
}

interface ExtractedRow {
  employeeNumber: string | null;
  employeeName:   string | null;
  date:           string;
  clockIn:        string | null;
  clockOut:       string | null;
  status:         string;
  hoursWorked:    number | null;
  overtimeHours:  number | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_ICON: Record<string, React.ReactNode> = {
  PRESENT:  <CheckCircle  className="h-4 w-4 text-green-500" />,
  LATE:     <AlertTriangle className="h-4 w-4 text-amber-500" />,
  ABSENT:   <XCircle      className="h-4 w-4 text-red-400" />,
  HALF_DAY: <Clock        className="h-4 w-4 text-blue-400" />,
  ON_LEAVE: <Clock        className="h-4 w-4 text-purple-400" />,
};

const STATUS_BADGE: Record<string, string> = {
  PRESENT:  "bg-green-100 text-green-700",
  LATE:     "bg-amber-100 text-amber-700",
  ABSENT:   "bg-red-100 text-red-600",
  HALF_DAY: "bg-blue-100 text-blue-700",
  ON_LEAVE: "bg-purple-100 text-purple-700",
};

const VALID_STATUSES = ["PRESENT", "LATE", "ABSENT", "HALF_DAY", "ON_LEAVE"] as const;

const fmtTime = (dt: string | null) =>
  dt ? new Date(dt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "—";

/* ------------------------------------------------------------------ */
/*  Upload Modal                                                         */
/* ------------------------------------------------------------------ */

function UploadModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [rows,      setRows]      = useState<ExtractedRow[] | null>(null);
  const [editRows,  setEditRows]  = useState<ExtractedRow[]>([]);
  const [saveResult, setSaveResult] = useState<{ saved: number; skipped: number; errors: string[] } | null>(null);
  const [fileName,  setFileName]  = useState<string>("");

  async function handleFile(file: File) {
    setError(null);
    setRows(null);
    setSaveResult(null);
    setFileName(file.name);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/admin/hr/attendance/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Extraction failed");
      if (json.data.length === 0) throw new Error("No attendance records found in this file.");
      setRows(json.data);
      setEditRows(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function updateRow(idx: number, field: keyof ExtractedRow, value: string) {
    setEditRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value || null };
      return next;
    });
  }

  function removeRow(idx: number) {
    setEditRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (editRows.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/hr/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: editRows }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Save failed");
      setSaveResult(json.data);
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const fileIcon = (name: string) => {
    if (name.match(/\.(xlsx?|csv)$/i)) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    if (name.match(/\.pdf$/i))         return <FileText        className="h-5 w-5 text-red-500" />;
    return                                    <FileImage       className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-800">Import Attendance</h2>
            {fileName && (
              <div className="flex items-center gap-1.5 ml-2 bg-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-600">
                {fileIcon(fileName)}
                <span className="max-w-[160px] truncate">{fileName}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Supported formats banner */}
          {!rows && !uploading && (
            <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5"><FileSpreadsheet className="h-4 w-4 text-green-500" /> Excel (.xlsx, .xls, .csv)</div>
              <div className="flex items-center gap-1.5"><FileText        className="h-4 w-4 text-red-400" />   PDF (.pdf) — AI extracted</div>
              <div className="flex items-center gap-1.5"><FileImage       className="h-4 w-4 text-blue-400" />  Image (.png, .jpg) — AI extracted</div>
            </div>
          )}

          {/* Drop zone */}
          {!rows && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                ${dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}
              `}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                  <p className="text-sm font-medium">Extracting attendance data…</p>
                  <p className="text-xs text-slate-400">AI is reading your document — this may take a moment</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Upload className="h-10 w-10 text-indigo-300" />
                  <p className="text-sm font-semibold text-slate-600">Drop file here or click to browse</p>
                  <p className="text-xs">Excel, CSV, PDF, or image (PNG/JPG)</p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp"
            onChange={onFileChange}
            className="hidden"
          />

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
            </div>
          )}

          {/* Save result */}
          {saveResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                <Check className="h-5 w-5" />
                Import complete!
              </div>
              <p className="text-sm text-green-600">
                ✅ {saveResult.saved} records saved · ⚠️ {saveResult.skipped} skipped (no matching employee)
              </p>
              {saveResult.errors.length > 0 && (
                <details className="text-xs text-red-600 mt-1">
                  <summary className="cursor-pointer">Show skipped ({saveResult.errors.length})</summary>
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {saveResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}

          {/* Preview table */}
          {rows && !saveResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  {editRows.length} records extracted — review before saving
                </p>
                <button
                  type="button"
                  onClick={() => { setRows(null); setEditRows([]); setFileName(""); }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Upload different file
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 uppercase bg-slate-50 border border-slate-200 rounded-t-lg">
                      <th className="px-3 py-2 text-left">Emp No.</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-center">Clock In</th>
                      <th className="px-3 py-2 text-center">Clock Out</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-right">Hours</th>
                      <th className="px-3 py-2 text-right">OT</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 border border-t-0 border-slate-200">
                    {editRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <input
                            value={r.employeeNumber ?? ""}
                            onChange={(e) => updateRow(i, "employeeNumber", e.target.value)}
                            className="w-24 border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={r.employeeName ?? ""}
                            onChange={(e) => updateRow(i, "employeeName", e.target.value)}
                            className="w-32 border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={r.date}
                            onChange={(e) => updateRow(i, "date", e.target.value)}
                            className="border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="time"
                            value={r.clockIn ?? ""}
                            onChange={(e) => updateRow(i, "clockIn", e.target.value)}
                            className="border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="time"
                            value={r.clockOut ?? ""}
                            onChange={(e) => updateRow(i, "clockOut", e.target.value)}
                            className="border border-slate-200 rounded px-1.5 py-0.5 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <select
                            value={r.status}
                            onChange={(e) => updateRow(i, "status", e.target.value)}
                            className={`border border-slate-200 rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status] ?? ""}`}
                          >
                            {VALID_STATUSES.map((s) => (
                              <option key={s} value={s}>{s.replace("_", " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">
                          {r.hoursWorked != null ? r.hoursWorked.toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-400">
                          {r.overtimeHours != null && r.overtimeHours > 0 ? r.overtimeHours.toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="text-slate-300 hover:text-red-400"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {rows && !saveResult && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
            <p className="text-xs text-slate-400">
              Tip: Correct any mismatches above before importing. Employee must exist in the system.
            </p>
            <button
              onClick={handleSave}
              disabled={saving || editRows.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving
                ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                : <><CloudUpload className="h-4 w-4" />Import {editRows.length} Records</>
              }
            </button>
          </div>
        )}

        {saveResult && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                            */
/* ------------------------------------------------------------------ */

export default function AttendancePage() {
  const [records, setRecords]   = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/admin/hr/attendance?date=${date}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRecords(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const present  = records.filter((r) => r.status === "PRESENT").length;
  const late     = records.filter((r) => r.status === "LATE").length;
  const absent   = records.filter((r) => r.status === "ABSENT").length;

  return (
    <>
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onImported={() => { load(); }}
        />
      )}

      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Attendance</h1>
            <p className="text-sm text-slate-500 mt-1">Daily clock-in / clock-out monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import Attendance
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xs text-slate-500">Present</p>
              <p className="text-xl font-bold text-green-700">{present}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-xs text-slate-500">Late</p>
              <p className="text-xl font-bold text-amber-600">{late}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-xs text-slate-500">Absent</p>
              <p className="text-xl font-bold text-red-600">{absent}</p>
            </div>
          </div>
        </div>

        {/* Import hint when empty */}
        {!loading && records.length === 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-start gap-4">
            <Upload className="h-8 w-8 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-700">No records for this date</p>
              <p className="text-xs text-indigo-500 mt-0.5">
                Click <strong>Import Attendance</strong> to upload an Excel sheet, PDF, or photo of the attendance logbook.
                The AI will automatically extract all attendance data.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left">Employee</th>
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Clock In</th>
                  <th className="px-5 py-3 text-center">Clock Out</th>
                  <th className="px-5 py-3 text-right">Hours</th>
                  <th className="px-5 py-3 text-right">OT Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                      No attendance records for this date
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">
                          {r.employee.lastName}, {r.employee.firstName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {r.employee.employeeNumber} · {r.employee.position}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{r.employee.department ?? "—"}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {STATUS_ICON[r.status]}
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center font-mono text-xs">{fmtTime(r.clockIn)}</td>
                      <td className="px-5 py-3 text-center font-mono text-xs">{fmtTime(r.clockOut)}</td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        {r.hoursWorked ? `${Number(r.hoursWorked).toFixed(1)}h` : "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500">
                        {r.overtimeHours && Number(r.overtimeHours) > 0
                          ? `${Number(r.overtimeHours).toFixed(1)}h` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
