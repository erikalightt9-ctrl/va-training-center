"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserCheck, UserX, Clock, Loader2, Plus } from "lucide-react";

interface Stats {
  active: number;
  onLeave: number;
  inactive: number;
  total: number;
  byDept: { department: string | null; _count: number }[];
}

const fmt = (n: number) => n.toLocaleString("en-PH");

export default function HrDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/hr/employees?stats=1")
      .then((r) => r.json())
      .then((j) => { if (j.success) setStats(j.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">HR & Payroll</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage employees, payroll, attendance, and leave
          </p>
        </div>
        <Link
          href="/admin/hr/employees/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-sm text-slate-500">Total Employees</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{fmt(stats?.total ?? 0)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm text-slate-500">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{fmt(stats?.active ?? 0)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm text-slate-500">On Leave</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{fmt(stats?.onLeave ?? 0)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <UserX className="h-5 w-5 text-slate-500" />
            </div>
            <span className="text-sm text-slate-500">Inactive / Separated</span>
          </div>
          <p className="text-2xl font-bold text-slate-600">{fmt(stats?.inactive ?? 0)}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Run Payroll",      desc: "Create a new payroll run for the current period",   href: "/admin/hr/payroll/new",        color: "bg-indigo-600 hover:bg-indigo-700" },
          { title: "Today's Attendance", desc: "View and manage today's attendance records",       href: "/admin/hr/attendance",         color: "bg-emerald-600 hover:bg-emerald-700" },
          { title: "Pending Leaves",   desc: "Review and approve pending leave requests",          href: "/admin/hr/leave?status=PENDING", color: "bg-amber-500 hover:bg-amber-600" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${item.color} text-white rounded-xl p-5 block transition-colors`}
          >
            <p className="font-semibold text-base">{item.title}</p>
            <p className="text-sm opacity-80 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* By Department */}
      {stats?.byDept && stats.byDept.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Headcount by Department</h2>
          <div className="space-y-2">
            {stats.byDept
              .sort((a, b) => b._count - a._count)
              .map((d) => (
                <div key={d.department ?? "unassigned"} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-40 truncate">
                    {d.department ?? "Unassigned"}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${Math.min((d._count / (stats.active || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-6 text-right">{d._count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
