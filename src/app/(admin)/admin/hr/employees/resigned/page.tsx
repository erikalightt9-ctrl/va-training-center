"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, UserX, AlertCircle, FileText, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string | null;
  status: string;
  separationDate: string | null;
  separationReason: string | null;
  lastWorkingDate: string | null;
  remarks: string | null;
  contracts: { basicSalary: number }[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—";

const STATUS_COLORS: Record<string, string> = {
  RESIGNED:   "bg-red-100 text-red-600",
  TERMINATED: "bg-red-100 text-red-800",
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ResignedEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/hr/employees/resigned")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) throw new Error(j.error);
        setEmployees(j.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      (e.position ?? "").toLowerCase().includes(q) ||
      (e.department ?? "").toLowerCase().includes(q) ||
      e.employeeNumber.toLowerCase().includes(q)
    );
  });

  const resigned   = filtered.filter((e) => e.status === "RESIGNED");
  const terminated = filtered.filter((e) => e.status === "TERMINATED");

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link href="/admin/hr/employees" className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to All Employees
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <UserX className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Separated Employees</h1>
              <p className="text-sm text-slate-500 mt-0.5">Resigned and terminated staff records</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/api/admin/hr/employees/export"
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              <FileText className="h-4 w-4" /> Export All Excel
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Total Separated</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{employees.filter((e) => e.status === "RESIGNED").length}</p>
            <p className="text-xs text-red-400 mt-0.5">Resigned</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-700">{employees.filter((e) => e.status === "TERMINATED").length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Terminated</p>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, position, department, or ID…"
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <UserX className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{search ? "No results match your search." : "No separated employees on record."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resigned */}
          {resigned.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Resigned ({resigned.length})
              </h2>
              <div className="space-y-2">
                {resigned.map((e) => <EmployeeCard key={e.id} emp={e} />)}
              </div>
            </div>
          )}

          {/* Terminated */}
          {terminated.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                Terminated ({terminated.length})
              </h2>
              <div className="space-y-2">
                {terminated.map((e) => <EmployeeCard key={e.id} emp={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                                */
/* ------------------------------------------------------------------ */

function EmployeeCard({ emp }: { emp: Employee }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 text-left transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-500 shrink-0">
            {emp.firstName[0]}{emp.lastName[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-800">{emp.lastName}, {emp.firstName}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[emp.status] ?? "bg-slate-100 text-slate-500"}`}>
                {emp.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              #{emp.employeeNumber} · {emp.position}{emp.department ? ` · ${emp.department}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Separation Date</p>
            <p className="text-sm font-medium text-slate-700">{fmtDate(emp.separationDate)}</p>
          </div>
          <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`} />
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Separation Date</p>
              <p className="font-medium text-slate-700">{fmtDate(emp.separationDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Last Working Date</p>
              <p className="font-medium text-slate-700">{fmtDate(emp.lastWorkingDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Separation Reason</p>
              <p className="font-medium text-slate-700">{emp.separationReason || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Last Salary</p>
              <p className="font-medium text-slate-700">
                {emp.contracts[0]?.basicSalary
                  ? `₱${Number(emp.contracts[0].basicSalary).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                  : "—"}
              </p>
            </div>
          </div>
          {emp.remarks && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Remarks</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{emp.remarks}</p>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Link href={`/admin/hr/employees/${emp.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition">
              View Full 201 File →
            </Link>
            <a href={`/api/admin/hr/employees/${emp.id}/export201`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-50 transition">
              <FileText className="h-3.5 w-3.5" /> Export 201 PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
