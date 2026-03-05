import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Users, Clock, CheckCircle2, TrendingUp, ClipboardCheck, CalendarClock } from "lucide-react";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { ScheduleStatusBadge } from "@/components/admin/ScheduleStatusBadge";
import { Progress } from "@/components/ui/progress";
import { getAnalyticsStats } from "@/lib/repositories/admin.repository";
import { getPresentNowCount } from "@/lib/repositories/attendance.repository";
import { getScheduleStats, getUpcomingSchedules } from "@/lib/repositories/schedule.repository";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard | VA Admin" };

export default async function AdminDashboardPage() {
  const [stats, presentNow, scheduleStats, upcomingSchedules] = await Promise.all([
    getAnalyticsStats(),
    getPresentNowCount(),
    getScheduleStats(),
    getUpcomingSchedules(5),
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of enrollment activity</p>
      </div>

      {/* Present Now banner */}
      <Link
        href="/admin/attendance"
        className="block mb-6 bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-100 rounded-lg p-2">
            <ClipboardCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              {presentNow} {presentNow === 1 ? "student" : "students"} present now
            </p>
            <p className="text-xs text-green-600">Click to view live attendance →</p>
          </div>
        </div>
      </Link>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <AnalyticsCard
          title="Total Enrollments"
          value={stats.totalEnrollments}
          icon={Users}
          colorClass="text-blue-600 bg-blue-100"
          subtitle="All time"
        />
        <AnalyticsCard
          title="Pending Review"
          value={stats.pendingCount}
          icon={Clock}
          colorClass="text-amber-600 bg-amber-100"
          subtitle="Awaiting decision"
        />
        <AnalyticsCard
          title="Approved"
          value={stats.approvedCount}
          icon={CheckCircle2}
          colorClass="text-green-600 bg-green-100"
          subtitle="All time"
        />
        <AnalyticsCard
          title="Recent (30 days)"
          value={stats.recentEnrollments}
          icon={TrendingUp}
          colorClass="text-purple-600 bg-purple-100"
          subtitle="Last 30 days"
        />
      </div>

      {/* Course breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Enrollments by Course</h2>
        <div className="space-y-4">
          {stats.enrollmentsByCourse.map((course) => {
            const pct =
              stats.totalEnrollments > 0
                ? Math.round((course.count / stats.totalEnrollments) * 100)
                : 0;
            return (
              <div key={course.slug}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{course.title}</span>
                  <span className="text-gray-500">
                    {course.count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Training Batches */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            Training Batches
          </h2>
          <Link
            href="/admin/schedules"
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600">Active Batches</p>
            <p className="text-lg font-bold text-blue-900">{scheduleStats.totalActive}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo-600">Students</p>
            <p className="text-lg font-bold text-indigo-900">{scheduleStats.totalStudents}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600">Available Slots</p>
            <p className="text-lg font-bold text-green-900">{scheduleStats.availableSlots}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-600">Starting Soon</p>
            <p className="text-lg font-bold text-amber-900">{scheduleStats.upcomingStarts}</p>
          </div>
        </div>

        {upcomingSchedules.length > 0 ? (
          <div className="space-y-2">
            {upcomingSchedules.map((s) => {
              const enrolled = s._count.students;
              const pct = s.maxCapacity > 0
                ? Math.round((enrolled / s.maxCapacity) * 100)
                : 0;
              return (
                <Link
                  key={s.id}
                  href={`/admin/schedules/${s.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.course.title} · Starts{" "}
                      {new Date(s.startDate).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="h-2 w-12" />
                      <span className="text-xs text-gray-500">
                        {enrolled}/{s.maxCapacity}
                      </span>
                    </div>
                    <ScheduleStatusBadge status={s.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No upcoming training batches.{" "}
            <Link href="/admin/schedules" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
