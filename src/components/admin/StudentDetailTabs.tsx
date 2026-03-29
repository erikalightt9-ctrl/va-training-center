"use client"
import { useState } from "react"
import {
  BookOpen,
  Trophy,
  ClipboardCheck,
  Star,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  UserCircle,
  BarChart2,
  ClipboardList,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ComingSoonBanner } from "@/components/shared/ComingSoonBanner"

/* ------------------------------------------------------------------ */
/*  Types (mirror what getStudentDetail returns)                       */
/* ------------------------------------------------------------------ */

interface AttendanceRecord {
  readonly id: string
  readonly clockIn: string
  readonly clockOut: string | null
}

interface QuizResult {
  readonly quizTitle: string
  readonly score: number
  readonly passed: boolean
  readonly completedAt: string
}

interface AssignmentGrade {
  readonly assignmentTitle: string
  readonly status: string
  readonly grade: number | null
  readonly submittedAt: string
}

interface Badge {
  readonly name: string
  readonly icon: string
  readonly earnedAt: string
}

interface Progress {
  readonly percent: number
  readonly completed: number
  readonly total: number
}

interface Enrollment {
  readonly fullName: string
  readonly contactNumber: string
  readonly dateOfBirth: string
  readonly employmentStatus: string
  readonly address: string
  readonly educationalBackground: string
  readonly workExperience: string | null
}

export interface StudentDetailData {
  readonly name: string
  readonly email: string
  readonly createdAt: string
  readonly course: { readonly title: string }
  readonly progress: Progress
  readonly quizAverage: number
  readonly assignmentsSubmitted: number
  readonly totalAssignments: number
  readonly totalPoints: number
  readonly enrollment: Enrollment
  readonly recentAttendance: readonly AttendanceRecord[]
  readonly quizResults: readonly QuizResult[]
  readonly assignmentGrades: readonly AssignmentGrade[]
  readonly badges: readonly Badge[]
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                     */
/* ------------------------------------------------------------------ */

const TABS = ["Info", "Attendance", "Progress", "Tasks"] as const
type Tab = (typeof TABS)[number]

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDuration(clockIn: string, clockOut: string | null): string {
  const end = clockOut ? new Date(clockOut).getTime() : Date.now()
  const diffMs = end - new Date(clockIn).getTime()
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60_000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                           */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  readonly label: string
  readonly value: string | number
  readonly icon: typeof BookOpen
  readonly colorClass: string
}) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                        */
/* ------------------------------------------------------------------ */

function ProgressBar({ percent }: { readonly percent: number }) {
  const color =
    percent >= 75 ? "bg-green-500" : percent >= 40 ? "bg-yellow-500" : "bg-red-400"

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">Course Progress</span>
        <span className="text-sm font-semibold text-gray-900">{percent}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab content components                                              */
/* ------------------------------------------------------------------ */

function InfoTab({ student }: { readonly student: StudentDetailData }) {
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <ProgressBar percent={student.progress.percent} />
        <p className="text-xs text-gray-400 mt-2">
          {student.progress.completed} of {student.progress.total} lessons completed
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Progress"
          value={`${student.progress.percent}%`}
          icon={BookOpen}
          colorClass="text-blue-700 bg-blue-50"
        />
        <StatCard
          label="Quiz Average"
          value={student.quizAverage > 0 ? `${student.quizAverage}%` : "—"}
          icon={Trophy}
          colorClass="text-amber-600 bg-amber-50"
        />
        <StatCard
          label="Assignments"
          value={`${student.assignmentsSubmitted}/${student.totalAssignments}`}
          icon={ClipboardCheck}
          colorClass="text-blue-700 bg-blue-50"
        />
        <StatCard
          label="Total Points"
          value={student.totalPoints.toLocaleString()}
          icon={Star}
          colorClass="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Profile details */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Student Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{student.enrollment.fullName}</p>
            </div>
            <div>
              <p className="text-gray-500">Contact Number</p>
              <p className="font-medium text-gray-900">{student.enrollment.contactNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Date of Birth</p>
              <p className="font-medium text-gray-900">
                {formatDate(student.enrollment.dateOfBirth)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Employment Status</p>
              <p className="font-medium text-gray-900">
                {student.enrollment.employmentStatus.replace(/_/g, " ")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{student.enrollment.address}</p>
            </div>
            <div>
              <p className="text-gray-500">Educational Background</p>
              <p className="font-medium text-gray-900">
                {student.enrollment.educationalBackground}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Work Experience</p>
              <p className="font-medium text-gray-900">
                {student.enrollment.workExperience || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {student.badges.length > 0 && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-gray-500" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {student.badges.map((b, i) => (
                <div
                  key={`${b.name}-${i}`}
                  className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                >
                  <span className="text-lg">{b.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(b.earnedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AttendanceTab({ student }: { readonly student: StudentDetailData }) {
  const records = student.recentAttendance

  if (records.length === 0) {
    return (
      <ComingSoonBanner
        feature="Attendance Tracking"
        description="No attendance records found for this student."
      />
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          Attendance Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-900">{formatDate(a.clockIn)}</p>
                <p className="text-xs text-gray-500">
                  {formatTime(a.clockIn)}
                  {a.clockOut ? ` → ${formatTime(a.clockOut)}` : " → Present"}
                </p>
              </div>
              <span className="text-xs font-mono text-gray-600">
                {formatDuration(a.clockIn, a.clockOut)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressTab({ student }: { readonly student: StudentDetailData }) {
  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <ProgressBar percent={student.progress.percent} />
        <p className="text-xs text-gray-400 mt-2">
          {student.progress.completed} of {student.progress.total} lessons completed
        </p>
      </div>

      {/* Quiz results */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gray-500" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student.quizResults.length > 0 ? (
            <div className="space-y-3">
              {student.quizResults.map((q, i) => (
                <div
                  key={`${q.quizTitle}-${i}`}
                  className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{q.quizTitle}</p>
                    <p className="text-xs text-gray-500">{formatDate(q.completedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span
                      className={`text-sm font-semibold ${
                        q.passed ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {q.score}%
                    </span>
                    {q.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-700" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No quiz attempts yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TasksTab({ student }: { readonly student: StudentDetailData }) {
  if (student.assignmentGrades.length === 0) {
    return (
      <ComingSoonBanner
        feature="Tasks"
        description="No assignments submitted yet for this student."
      />
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-gray-500" />
          Assignment Grades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Assignment</th>
                <th className="text-left py-2 font-medium text-gray-600">Status</th>
                <th className="text-center py-2 font-medium text-gray-600">Grade</th>
                <th className="text-right py-2 font-medium text-gray-600">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {student.assignmentGrades.map((a, i) => (
                <tr key={`${a.assignmentTitle}-${i}`} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 font-medium text-gray-900">{a.assignmentTitle}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${
                        a.status === "GRADED"
                          ? "text-green-700 bg-green-100"
                          : a.status === "SUBMITTED"
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-center font-semibold text-gray-700">
                    {a.grade !== null ? `${a.grade}%` : "—"}
                  </td>
                  <td className="py-2.5 text-right text-gray-500">
                    {formatDate(a.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab strip                                                           */
/* ------------------------------------------------------------------ */

const TAB_ICONS: Record<Tab, typeof UserCircle> = {
  Info: UserCircle,
  Attendance: Clock,
  Progress: BarChart2,
  Tasks: ClipboardList,
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

interface StudentDetailTabsProps {
  readonly student: StudentDetailData
  readonly initialTab?: string
}

export function StudentDetailTabs({ student, initialTab }: StudentDetailTabsProps) {
  const resolvedInitial = (TABS as readonly string[]).includes(initialTab ?? "")
    ? (initialTab as Tab)
    : "Info"

  const [activeTab, setActiveTab] = useState<Tab>(resolvedInitial)

  return (
    <div>
      {/* Tab strip */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab]
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === "Info" && <InfoTab student={student} />}
      {activeTab === "Attendance" && <AttendanceTab student={student} />}
      {activeTab === "Progress" && <ProgressTab student={student} />}
      {activeTab === "Tasks" && <TasksTab student={student} />}
    </div>
  )
}
