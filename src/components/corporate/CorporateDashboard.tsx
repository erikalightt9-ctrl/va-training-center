"use client";

import Link from "next/link";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  ClipboardList,
  GraduationCap,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Sparkles,
  FolderOpen,
  Globe,
  Settings,
  MessageSquare,
  Bell,
  Headphones,
} from "lucide-react";
import { FeatureCard } from "@/components/corporate/FeatureCard";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RecentEnrollment {
  readonly id: string;
  readonly status: string;
  readonly courseTier: string;
  readonly createdAt: Date | string;
  readonly student: { readonly id: string; readonly name: string; readonly email: string } | null;
  readonly course: { readonly id: string; readonly title: string; readonly slug: string };
}

interface DashboardStats {
  readonly organizationName: string;
  readonly maxSeats: number;
  readonly industry: string | null;
  readonly logoUrl: string | null;
  readonly totalEmployees: number;
  readonly activeEnrollments: number;
  readonly totalEnrollments: number;
  readonly certificatesEarned: number;
  readonly recentEnrollments: ReadonlyArray<RecentEnrollment>;
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  readonly label: string;
  readonly value: number | string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { readonly status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-700",
    ACTIVE: "bg-blue-100 text-blue-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

// ModuleCard is replaced by the state-aware FeatureCard component.
// FeatureCard is imported from @/components/corporate/FeatureCard.

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CorporateDashboard({
  stats,
}: {
  readonly stats: DashboardStats;
}) {
  const seatPct = Math.min(100, Math.round((stats.totalEmployees / stats.maxSeats) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{stats.organizationName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tenant Dashboard{stats.industry ? ` · ${stats.industry}` : ""}
          </p>
        </div>
        {stats.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stats.logoUrl} alt="Logo" className="h-10 object-contain" />
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Members"       value={stats.totalEmployees}  icon={Users}   color="bg-blue-100 text-blue-600" />
        <StatCard label="Active Enrollments" value={stats.activeEnrollments} icon={BookOpen} color="bg-green-100 text-green-600" />
        <StatCard label="Certificates"       value={stats.certificatesEarned} icon={Award}   color="bg-purple-100 text-purple-600" />
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-gray-400">{seatPct}% used</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalEmployees} / {stats.maxSeats}
          </div>
          <div className="text-sm text-gray-500 mb-2">Seats Used</div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${seatPct >= 90 ? "bg-red-500" : "bg-amber-500"}`}
              style={{ width: `${seatPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module hub grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Modules
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* ── Core (live) ──────────────────────────────────────────── */}
          <FeatureCard href="/corporate/employees"    icon={Users}         label="Team"          description="Manage employees and seat assignments"          color="bg-blue-100 text-blue-600"    badge={stats.totalEmployees} />
          <FeatureCard href="/corporate/courses"      icon={BookOpen}      label="Courses"       description="Browse and assign courses to your team"         color="bg-emerald-100 text-emerald-600" />
          <FeatureCard href="/corporate/enrollments"  icon={ClipboardList} label="Enrollments"   description="Track course enrollments and progress"          color="bg-green-100 text-green-600"   badge={stats.activeEnrollments} />
          <FeatureCard href="/corporate/tasks"        icon={CheckSquare}   label="Tasks"         description="Assign and track team tasks with deadlines"     color="bg-orange-100 text-orange-600" />
          <FeatureCard href="/corporate/settings"     icon={Settings}      label="Settings"      description="Organization details, billing, and branding"    color="bg-gray-100 text-gray-600" />
          {/* ── Secondary (beta) ─────────────────────────────────────── */}
          <FeatureCard href="/corporate/trainers"     icon={GraduationCap} label="Trainers"      description="View and manage assigned trainers"              color="bg-indigo-100 text-indigo-600" />
          <FeatureCard href="/corporate/calendar"     icon={CalendarDays}  label="Calendar"      description="Sessions, deadlines, and team events"           color="bg-cyan-100 text-cyan-600" />
          <FeatureCard href="/corporate/reports"      icon={BarChart3}     label="Reports"       description="Analytics, completion rates, and exports"       color="bg-purple-100 text-purple-600" />
          {/* ── Advanced (planned / coming soon) ─────────────────────── */}
          <FeatureCard href="/corporate/ai-tools"     icon={Sparkles}      label="AI Tools"      description="Summarize, grammar check, and quiz generation"  color="bg-pink-100 text-pink-600" />
          <FeatureCard href="/corporate/files"        icon={FolderOpen}    label="Files"         description="Manage documents and training materials"        color="bg-yellow-100 text-yellow-600" />
          <FeatureCard href="/corporate/website"      icon={Globe}         label="Website"       description="Customize your public portal and branding"      color="bg-teal-100 text-teal-600" />
          <FeatureCard href="/corporate/messages"     icon={MessageSquare} label="Messages"      description="Internal messaging between team members"        color="bg-violet-100 text-violet-600" />
          <FeatureCard href="/corporate/announcements" icon={Bell}         label="Announcements" description="Broadcast updates to your entire organization"  color="bg-rose-100 text-rose-600" />
          <FeatureCard href="/corporate/support"      icon={Headphones}    label="Support"       description="Submit and track support requests"              color="bg-sky-100 text-sky-600" />
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Recent Enrollments</h2>
          </div>
          <Link href="/corporate/enrollments" className="text-xs text-blue-600 hover:underline">
            View all →
          </Link>
        </div>

        {stats.recentEnrollments.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No enrollments yet. Start by enrolling employees in courses.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {enrollment.student?.name ?? "Unknown"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {enrollment.course.title} · {enrollment.courseTier}
                  </div>
                </div>
                <StatusBadge status={enrollment.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
