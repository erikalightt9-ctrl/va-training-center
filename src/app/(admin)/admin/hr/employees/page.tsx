"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Plus, Search, UserCircle } from "lucide-react";

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string | null;
  status: string;
  employmentType: string;
  hireDate: string;
  contracts: { basicSalary: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:      "bg-green-100 text-green-700",
  ON_LEAVE:    "bg-amber-100 text-amber-700",
  INACTIVE:    "bg-slate-100 text-slate-500",
  RESIGNED:    "bg-red-100 text-red-600",
  TERMINATED:  "bg-red-100 text-red-700",
  PROBATIONARY: "bg-blue-100 text-blue-700",
};

const fmt = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search)       params.set("search",     search);
      if (statusFilter) params.set("status",     statusFilter);
      if (deptFilter)   params.set("department", deptFilter);
      const res  = await fetch(`/api/admin/hr/employees?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setEmployees(json.data.data);
      setTotal(json.data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deptFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">{total} total employees</p>
        </div>
        <Link
          href="/admin/hr/employees/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-72"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="PROBATIONARY">Probationary</option>
          <option value="RESIGNED">Resigned</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        <input
          type="text"
          placeholder="Filter by department"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
        />
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
                <th className="px-5 py-3 text-left">Position / Dept</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-right">Basic Salary</th>
                <th className="px-5 py-3 text-left">Hire Date</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {emp.lastName}, {emp.firstName}
                          </p>
                          <p className="text-xs text-slate-400">{emp.employeeNumber} · {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-800">{emp.position}</p>
                      <p className="text-xs text-slate-400">{emp.department ?? "—"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-500 capitalize">
                        {emp.employmentType.replace("_", " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">
                      {emp.contracts[0] ? fmt(Number(emp.contracts[0].basicSalary)) : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {new Date(emp.hireDate).toLocaleDateString("en-PH")}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[emp.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {emp.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/hr/employees/${emp.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View 201
                      </Link>
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
