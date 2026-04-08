"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, AlertCircle, ArrowLeft, Download, FileDown,
  CheckCircle, DollarSign, Users,
} from "lucide-react";

interface PayrollLine {
  id: string;
  employeeId: string;
  basicSalary: number;
  daysWorked: number;
  overtimeHours: number;
  overtimePay: number;
  allowances: number;
  grossPay: number;
  sssEmployee: number;
  philhealthEmployee: number;
  pagibigEmployee: number;
  withholdingTax: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  remarks: string | null;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    position: string;
    department: string | null;
  };
}

interface PayrollRun {
  id: string;
  runNumber: string;
  periodStart: string;
  periodEnd: string;
  payDate: string | null;
  status: "DRAFT" | "APPROVED" | "PAID" | "VOIDED";
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  lines: PayrollLine[];
}

const fmt   = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
const fmtDt = (s: string) => new Date(s).toLocaleDateString("en-PH");

const STATUS_STYLES: Record<string, string> = {
  DRAFT:    "bg-slate-100 text-slate-600",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID:     "bg-green-100 text-green-700",
  VOIDED:   "bg-red-100 text-red-600",
};

export default function PayrollRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun]         = useState<PayrollRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/admin/hr/payroll/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRun(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !run) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error ?? "Payroll run not found"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/hr/payroll" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{run.runNumber}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[run.status]}`}>
                {run.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {fmtDt(run.periodStart)} — {fmtDt(run.periodEnd)}
              {run.payDate && ` · Pay Date: ${fmtDt(run.payDate)}`}
            </p>
          </div>
        </div>

        {/* Batch download */}
        <a
          href={`/api/admin/hr/payroll/${id}/payslips`}
          download
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          <FileDown className="h-4 w-4" />
          Download All Payslips
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <Users className="h-8 w-8 text-indigo-400" />
          <div>
            <p className="text-xs text-slate-500">Employees</p>
            <p className="text-xl font-bold text-slate-800">{run.lines.length}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-xs text-slate-500">Total Net Pay</p>
            <p className="text-xl font-bold text-emerald-700">{fmt(Number(run.totalNet))}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Gross Pay</p>
          <p className="text-base font-semibold text-slate-700">{fmt(Number(run.totalGross))}</p>
          <p className="text-xs text-slate-400 mt-0.5">Deductions: {fmt(Number(run.totalDeductions))}</p>
        </div>
      </div>

      {/* Payslip table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-slate-400" />
            Employee Payslips
          </h2>
          <p className="text-xs text-slate-400">{run.lines.length} records</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left">Employee</th>
              <th className="px-5 py-3 text-right">Basic</th>
              <th className="px-5 py-3 text-right">OT Pay</th>
              <th className="px-5 py-3 text-right">Gross Pay</th>
              <th className="px-5 py-3 text-right">Deductions</th>
              <th className="px-5 py-3 text-right font-bold text-indigo-700">Net Pay</th>
              <th className="px-5 py-3 text-center">Payslip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {run.lines.map((line) => (
              <tr key={line.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-800">
                    {line.employee.lastName}, {line.employee.firstName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {line.employee.employeeNumber} · {line.employee.position}
                  </p>
                  {line.employee.department && (
                    <p className="text-xs text-slate-400">{line.employee.department}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-slate-600 font-mono text-xs">
                  {fmt(Number(line.basicSalary))}
                </td>
                <td className="px-5 py-3 text-right text-slate-500 font-mono text-xs">
                  {Number(line.overtimePay) > 0 ? fmt(Number(line.overtimePay)) : "—"}
                </td>
                <td className="px-5 py-3 text-right text-slate-700 font-mono text-xs font-medium">
                  {fmt(Number(line.grossPay))}
                </td>
                <td className="px-5 py-3 text-right text-red-500 font-mono text-xs">
                  -{fmt(Number(line.totalDeductions))}
                </td>
                <td className="px-5 py-3 text-right font-bold text-indigo-700 font-mono text-sm">
                  {fmt(Number(line.netPay))}
                </td>
                <td className="px-5 py-3 text-center">
                  <a
                    href={`/api/admin/hr/payroll/${id}/payslip/${line.id}`}
                    download
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50"
                  >
                    <Download className="h-3 w-3" />
                    PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deductions breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Deductions Breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left">Employee</th>
              <th className="px-5 py-3 text-right">SSS</th>
              <th className="px-5 py-3 text-right">PhilHealth</th>
              <th className="px-5 py-3 text-right">Pag-IBIG</th>
              <th className="px-5 py-3 text-right">W/Tax</th>
              <th className="px-5 py-3 text-right">Other</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {run.lines.map((line) => (
              <tr key={line.id} className="hover:bg-slate-50 text-xs">
                <td className="px-5 py-2 text-slate-700 font-medium">
                  {line.employee.lastName}, {line.employee.firstName}
                </td>
                <td className="px-5 py-2 text-right font-mono text-slate-600">
                  {fmt(Number(line.sssEmployee))}
                </td>
                <td className="px-5 py-2 text-right font-mono text-slate-600">
                  {fmt(Number(line.philhealthEmployee))}
                </td>
                <td className="px-5 py-2 text-right font-mono text-slate-600">
                  {fmt(Number(line.pagibigEmployee))}
                </td>
                <td className="px-5 py-2 text-right font-mono text-slate-600">
                  {fmt(Number(line.withholdingTax))}
                </td>
                <td className="px-5 py-2 text-right font-mono text-slate-500">
                  {Number(line.otherDeductions) > 0 ? fmt(Number(line.otherDeductions)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
