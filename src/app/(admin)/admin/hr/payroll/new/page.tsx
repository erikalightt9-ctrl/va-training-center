"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, Plus, Trash2, Users,
  CalendarDays, DollarSign, Info,
} from "lucide-react";

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
  allowance?: number | null;
  contracts: { basicSalary: number }[];
}

interface LineInput {
  employeeId: string;
  basicSalary: number;
  totalWorkingDays: number;
  absentDays: number;
  lateMins: number;
  regHolidayDays: number;
  specHolidayDays: number;
  overtimeHours: number;
  nightDiffHours: number;
  allowances: number;
  otherDeductions: number;
  remarks: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmt = (n: number) =>
  `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

/** Count Mon-Fri days in a date range */
function countWorkingDays(start: string, end: string): number {
  if (!start || !end) return 22;
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count || 22;
}

/** DOLE preview computation (mirrors server logic) */
function previewNet(line: LineInput): number {
  const daily  = line.basicSalary / line.totalWorkingDays;
  const hourly = daily / 8;
  const daysWorked = Math.max(0, line.totalWorkingDays - line.absentDays - line.regHolidayDays);
  const earnedBasic = daily * daysWorked;
  const absenceDeduction = daily * line.absentDays;
  const lateDeduction    = hourly * (line.lateMins / 60);
  const holidayPay = (daily * 2.00 * line.regHolidayDays) + (daily * 1.30 * line.specHolidayDays);
  const overtimePay  = hourly * 0.25 * line.overtimeHours;
  const nightDiffPay = hourly * 0.10 * line.nightDiffHours;
  const gross = earnedBasic + holidayPay + overtimePay + nightDiffPay + line.allowances;
  // simplified deduction estimate (15% for mandatory + tax)
  const mandatoryEst = line.basicSalary * 0.11;
  const net = gross - absenceDeduction - lateDeduction - mandatoryEst - line.otherDeductions;
  return Math.max(0, net);
}

function defaultLine(emp: Employee): LineInput {
  const salary = emp.contracts[0] ? Number(emp.contracts[0].basicSalary) : 0;
  return {
    employeeId:       emp.id,
    basicSalary:      salary,
    totalWorkingDays: 22,
    absentDays:       0,
    lateMins:         0,
    regHolidayDays:   0,
    specHolidayDays:  0,
    overtimeHours:    0,
    nightDiffHours:   0,
    allowances:       emp.allowance ? Number(emp.allowance) : 0,
    otherDeductions:  0,
    remarks:          "",
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-component: collapsible employee row                            */
/* ------------------------------------------------------------------ */

function EmployeeRow({
  emp,
  line,
  onChange,
  onRemove,
}: {
  emp: Employee;
  line: LineInput;
  onChange: (updated: LineInput) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function set<K extends keyof LineInput>(key: K, val: LineInput[K]) {
    onChange({ ...line, [key]: val });
  }

  const numField = (
    key: keyof LineInput,
    label: string,
    step = "0.5",
    hint?: string
  ) => (
    <div>
      <label className="block text-[10px] font-medium text-slate-500 mb-0.5 uppercase tracking-wide">
        {label}
        {hint && (
          <span className="ml-1 text-slate-400 normal-case font-normal">{hint}</span>
        )}
      </label>
      <input
        type="number"
        min={0}
        step={step}
        value={line[key] as number}
        onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Collapsed header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer hover:bg-slate-50 select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {emp.lastName}, {emp.firstName}
          </p>
          <p className="text-xs text-slate-400">
            {emp.employeeNumber} · {emp.position}
            {emp.department ? ` · ${emp.department}` : ""}
          </p>
        </div>
        <div className="text-right mr-4">
          <p className="text-xs text-slate-400">Basic Salary</p>
          <p className="text-sm font-semibold text-slate-700">{fmt(line.basicSalary)}</p>
        </div>
        <div className="text-right mr-4">
          <p className="text-xs text-slate-400">Est. Net Pay</p>
          <p className="text-sm font-bold text-indigo-600">{fmt(previewNet(line))}</p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <span className="text-xs text-slate-400">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded fields */}
      {expanded && (
        <div className="px-4 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Basic salary override */}
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-0.5 uppercase tracking-wide">
              Basic Salary (₱)
            </label>
            <input
              type="number"
              min={0}
              step="100"
              value={line.basicSalary}
              onChange={(e) => set("basicSalary", parseFloat(e.target.value) || 0)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {numField("totalWorkingDays", "Working Days", "1", "(in period)")}
          {numField("absentDays",       "Absent Days",   "0.5")}
          {numField("lateMins",         "Late (mins)",   "1")}

          {numField("regHolidayDays",  "Reg. Holiday Worked", "1", "(200%)")}
          {numField("specHolidayDays", "Spec. Holiday Worked","1", "(130%)")}
          {numField("overtimeHours",   "OT Hours",             "0.5", "(+25%)")}
          {numField("nightDiffHours",  "Night Diff Hrs",       "0.5", "(+10%)")}

          {numField("allowances",     "Allowances (₱)",   "100")}
          {numField("otherDeductions","Other Deductions (₱)","100")}

          {/* Remarks spans 2 cols */}
          <div className="col-span-2">
            <label className="block text-[10px] font-medium text-slate-500 mb-0.5 uppercase tracking-wide">Remarks</label>
            <input
              type="text"
              maxLength={300}
              value={line.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Optional notes"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function NewPayrollRunPage() {
  const router = useRouter();

  /* Period & meta */
  const today      = new Date().toISOString().split("T")[0];
  const firstOfMonth = today.slice(0, 8) + "01";
  const [periodStart, setPeriodStart] = useState(firstOfMonth);
  const [periodEnd,   setPeriodEnd]   = useState(today);
  const [payDate,     setPayDate]     = useState(today);
  const [notes,       setNotes]       = useState("");

  /* Employees */
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loadingEmps,  setLoadingEmps]  = useState(true);
  const [lines, setLines]               = useState<LineInput[]>([]);
  const [empPickerOpen, setEmpPickerOpen] = useState(false);
  const [empSearch, setEmpSearch]       = useState("");

  /* Submit */
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState<string | null>(null);

  // Load employees
  useEffect(() => {
    fetch("/api/admin/hr/employees?limit=500&status=ACTIVE")
      .then((r) => r.json())
      .then((j) => { if (j.success) setAllEmployees(j.data.data); })
      .finally(() => setLoadingEmps(false));
  }, []);

  // Auto-update totalWorkingDays when period changes
  useEffect(() => {
    const wd = countWorkingDays(periodStart, periodEnd);
    setLines((prev) =>
      prev.map((l) => ({ ...l, totalWorkingDays: wd }))
    );
  }, [periodStart, periodEnd]);

  const addEmployee = useCallback((emp: Employee) => {
    if (lines.some((l) => l.employeeId === emp.id)) return;
    const wd = countWorkingDays(periodStart, periodEnd);
    setLines((prev) => [...prev, { ...defaultLine(emp), totalWorkingDays: wd }]);
    setEmpPickerOpen(false);
    setEmpSearch("");
  }, [lines, periodStart, periodEnd]);

  const removeEmployee = useCallback((employeeId: string) => {
    setLines((prev) => prev.filter((l) => l.employeeId !== employeeId));
  }, []);

  const updateLine = useCallback((employeeId: string, updated: LineInput) => {
    setLines((prev) => prev.map((l) => l.employeeId === employeeId ? updated : l));
  }, []);

  const addAll = () => {
    const wd = countWorkingDays(periodStart, periodEnd);
    const existing = new Set(lines.map((l) => l.employeeId));
    const toAdd = allEmployees
      .filter((e) => !existing.has(e.id) && e.contracts.length > 0)
      .map((e) => ({ ...defaultLine(e), totalWorkingDays: wd }));
    setLines((prev) => [...prev, ...toAdd]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) { setError("Add at least one employee."); return; }
    setSaving(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/hr/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart,
          periodEnd,
          payDate:  payDate || undefined,
          notes:    notes   || undefined,
          lines:    lines.map((l) => ({
            ...l,
            remarks: l.remarks || undefined,
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create payroll run");
      router.push(`/admin/hr/payroll/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const filteredEmps = allEmployees.filter((e) => {
    const q = empSearch.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.employeeNumber.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q)
    );
  });

  const selectedIds = new Set(lines.map((l) => l.employeeId));
  const linesByEmpId = Object.fromEntries(lines.map((l) => [l.employeeId, l]));
  const estTotal = lines.reduce((s, l) => s + previewNet(l), 0);

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/hr/payroll"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">New Payroll Run</h1>
          <p className="text-xs text-slate-400 mt-0.5">DOLE-compliant computation · SSS · PhilHealth · Pag-IBIG · BIR</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {/* Period & meta */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">Pay Period</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Period Start <span className="text-red-500">*</span></label>
            <input type="date" required value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Period End <span className="text-red-500">*</span></label>
            <input type="date" required value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Pay Date</label>
            <input type="date" value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <input type="text" value={notes} maxLength={200}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      {/* DOLE rules info banner */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-700">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">DOLE Computation Rules Applied Automatically</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <span>• Reg. Holiday worked = <strong>200%</strong> daily rate</span>
            <span>• Special Holiday worked = <strong>130%</strong> daily rate</span>
            <span>• Overtime = hourly rate × <strong>+25%</strong></span>
            <span>• Night Differential = hourly rate × <strong>+10%</strong></span>
            <span>• Absent deduction = daily rate × absent days</span>
            <span>• Late deduction = hourly rate × late minutes/60</span>
            <span>• Mandatory deductions: SSS, PhilHealth, Pag-IBIG</span>
            <span>• BIR withholding tax on taxable income</span>
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">
              Employees ({lines.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {lines.length === 0 && allEmployees.filter(e => e.contracts.length > 0).length > 0 && (
              <button
                type="button"
                onClick={addAll}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50"
              >
                Add All Employees
              </button>
            )}
            <button
              type="button"
              onClick={() => setEmpPickerOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add Employee
            </button>
          </div>
        </div>

        {/* Employee picker */}
        {empPickerOpen && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <input
              type="text"
              placeholder="Search by name, employee number, position…"
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            {loadingEmps ? (
              <div className="flex items-center justify-center py-4 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredEmps.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No employees found</p>
                )}
                {filteredEmps.map((emp) => {
                  const already = selectedIds.has(emp.id);
                  const noSalary = emp.contracts.length === 0;
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      disabled={already || noSalary}
                      onClick={() => addEmployee(emp)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                        ${already ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "hover:bg-indigo-50 cursor-pointer"}
                      `}
                    >
                      <div>
                        <span className="font-medium text-slate-800">
                          {emp.lastName}, {emp.firstName}
                        </span>
                        <span className="text-slate-400 ml-2 text-xs">{emp.employeeNumber} · {emp.position}</span>
                        {noSalary && <span className="ml-2 text-xs text-amber-500">(no contract)</span>}
                      </div>
                      {already && <span className="text-xs text-slate-400">Added</span>}
                      {!already && !noSalary && (
                        <span className="text-xs text-indigo-500 font-medium">
                          {fmt(Number(emp.contracts[0]?.basicSalary ?? 0))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Employee rows */}
        {lines.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Click "Add Employee" or "Add All Employees" to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allEmployees
              .filter((e) => selectedIds.has(e.id))
              .map((emp) => (
                <EmployeeRow
                  key={emp.id}
                  emp={emp}
                  line={linesByEmpId[emp.id]}
                  onChange={(updated) => updateLine(emp.id, updated)}
                  onRemove={() => removeEmployee(emp.id)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Summary bar + submit */}
      {lines.length > 0 && (
        <div className="sticky bottom-0 bg-white border border-slate-200 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-slate-400">Employees: </span>
              <span className="font-semibold text-slate-700">{lines.length}</span>
            </div>
            <div>
              <span className="text-slate-400">Est. Total Net: </span>
              <span className="font-bold text-indigo-600 text-base">{fmt(estTotal)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Info className="h-3 w-3" /> Preview only — final amounts computed server-side
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || lines.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 text-sm"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" />Computing…</>
              : <><DollarSign className="h-4 w-4" />Generate Payroll Run</>
            }
          </button>
        </div>
      )}
    </form>
  );
}
