"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

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

const STATUS_ICON: Record<string, React.ReactNode> = {
  PRESENT:  <CheckCircle className="h-4 w-4 text-green-500" />,
  LATE:     <AlertTriangle className="h-4 w-4 text-amber-500" />,
  ABSENT:   <XCircle className="h-4 w-4 text-red-400" />,
  HALF_DAY: <Clock className="h-4 w-4 text-blue-400" />,
  ON_LEAVE: <Clock className="h-4 w-4 text-purple-400" />,
};

const fmtTime = (dt: string | null) =>
  dt ? new Date(dt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "—";

export default function AttendancePage() {
  const [records, setRecords]   = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);

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
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">Daily clock-in / clock-out monitoring</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Summary */}
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
                      <p className="font-medium text-slate-800">{r.employee.lastName}, {r.employee.firstName}</p>
                      <p className="text-xs text-slate-400">{r.employee.employeeNumber} · {r.employee.position}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{r.employee.department ?? "—"}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {STATUS_ICON[r.status]}
                        <span className="text-xs">{r.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-xs">{fmtTime(r.clockIn)}</td>
                    <td className="px-5 py-3 text-center font-mono text-xs">{fmtTime(r.clockOut)}</td>
                    <td className="px-5 py-3 text-right text-slate-700">
                      {r.hoursWorked ? `${Number(r.hoursWorked).toFixed(1)}h` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">
                      {r.overtimeHours && Number(r.overtimeHours) > 0 ? `${Number(r.overtimeHours).toFixed(1)}h` : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
