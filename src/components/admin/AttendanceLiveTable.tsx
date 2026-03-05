"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, LogOut, CalendarDays, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AttendanceRow {
  readonly id: string;
  readonly studentName: string;
  readonly courseTitle: string;
  readonly clockIn: string;
  readonly clockOut: string | null;
  readonly isActive: boolean;
}

interface AttendanceSummary {
  readonly presentNow: number;
  readonly clockedOutToday: number;
  readonly totalToday: number;
  readonly records: ReadonlyArray<AttendanceRow>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(clockIn: string, clockOut: string | null): string {
  const end = clockOut ? new Date(clockOut).getTime() : Date.now();
  const diffMs = end - new Date(clockIn).getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function toDateInputValue(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const REFRESH_INTERVAL_MS = 30_000;

export function AttendanceLiveTable() {
  const [date, setDate] = useState(() => toDateInputValue(new Date()));
  const [data, setData] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isToday = date === toDateInputValue(new Date());

  const fetchData = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true);
      try {
        const res = await fetch(`/api/admin/attendance?date=${date}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [date],
  );

  /* Initial load + date change */
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  /* Auto-refresh every 30s when viewing today */
  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isToday, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {/* Date picker + refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isToday && (
            <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">
              Live
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <AnalyticsCard
            title="Present Now"
            value={data.presentNow}
            icon={Users}
            colorClass="text-green-600 bg-green-100"
            subtitle="Currently clocked in"
          />
          <AnalyticsCard
            title="Clocked Out"
            value={data.clockedOutToday}
            icon={LogOut}
            colorClass="text-gray-600 bg-gray-100"
            subtitle="Completed for today"
          />
          <AnalyticsCard
            title="Total Records"
            value={data.totalToday}
            icon={CalendarDays}
            colorClass="text-blue-600 bg-blue-100"
            subtitle={isToday ? "Today" : date}
          />
        </div>
      )}

      {/* Attendance table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Student
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Course
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Clock In
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Clock Out
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Duration
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data && data.records.length > 0 ? (
                data.records.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.studentName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.courseTitle}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatTime(row.clockIn)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.clockOut ? formatTime(row.clockOut) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {formatDuration(row.clockIn, row.clockOut)}
                    </td>
                    <td className="px-4 py-3">
                      {row.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2.5 py-0.5">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No attendance records for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
