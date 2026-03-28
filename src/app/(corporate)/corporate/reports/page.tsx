"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ReportStats {
  readonly totalEmployees: number;
  readonly activeEnrollments: number;
  readonly completedEnrollments: number;
  readonly certificatesEarned: number;
  readonly completionRate: number;
  readonly enrollmentsByMonth: ReadonlyArray<{ month: string; count: number }>;
  readonly topCourses: ReadonlyArray<{ title: string; enrollments: number; completions: number }>;
  readonly statusBreakdown: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/*  Sparkline bar                                                      */
/* ------------------------------------------------------------------ */

function MiniBar({ value, max, label }: { readonly value: number; readonly max: number; readonly label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-8 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-6 text-right">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ label, value, icon: Icon, color, sub }: {
  readonly label: string;
  readonly value: number | string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly color: string;
  readonly sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CorporateReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/corporate/reports")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const r = await fetch("/api/corporate/reports/export");
      if (!r.ok) throw new Error("Export failed");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `training-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16 text-sm text-gray-500">
        Unable to load report data. Please try again.
      </div>
    );
  }

  const maxMonthly = Math.max(...stats.enrollmentsByMonth.map((m) => m.count), 1);
  const maxCourse = Math.max(...stats.topCourses.map((c) => c.enrollments), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analytics, completion rates, and exports</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export CSV
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Team Members"
          value={stats.totalEmployees}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Active Enrollments"
          value={stats.activeEnrollments}
          icon={BookOpen}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label="Certificates Earned"
          value={stats.certificatesEarned}
          icon={Award}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={TrendingUp}
          color="bg-amber-100 text-amber-600"
          sub={`${stats.completedEnrollments} of ${stats.completedEnrollments + stats.activeEnrollments} completed`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Enrollments by Month</h2>
          </div>
          {stats.enrollmentsByMonth.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {stats.enrollmentsByMonth.map((m) => (
                <MiniBar key={m.month} value={m.count} max={maxMonthly} label={m.month.slice(0, 3)} />
              ))}
            </div>
          )}
        </div>

        {/* Top courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Top Courses</h2>
          </div>
          {stats.topCourses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No enrollments yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topCourses.map((course) => (
                <div key={course.title} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-700 truncate pr-4">{course.title}</p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {course.completions}/{course.enrollments}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-blue-500 rounded-full"
                      style={{ width: `${Math.round((course.enrollments / maxCourse) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Enrollment Status Breakdown</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => {
              const colors: Record<string, string> = {
                APPROVED: "bg-green-100 text-green-700",
                ACTIVE:   "bg-blue-100 text-blue-700",
                PENDING:  "bg-yellow-100 text-yellow-700",
                REJECTED: "bg-red-100 text-red-700",
                COMPLETED: "bg-purple-100 text-purple-700",
              };
              return (
                <div
                  key={status}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors[status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  <span className="text-xs font-medium">{status}</span>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
