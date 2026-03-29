"use client"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  ClipboardList,
  Clock,
  PlusCircle,
  FileText,
} from "lucide-react"
import { ComingSoonBanner } from "@/components/shared/ComingSoonBanner"

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

const TABS = ["Overview", "Lessons", "Schedule", "Enrollments", "Assignments"] as const
type Tab = (typeof TABS)[number]

interface CourseData {
  id: string
  title: string
  slug: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    lessons?: number
    enrollments?: number
    assignments?: number
  }
}

interface LessonItem {
  id: string
  title: string
  order: number
  durationMin: number | null
  isPublished: boolean
}

interface EnrollmentItem {
  id: string
  fullName: string
  email: string
  status: string
  createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function TabStrip({
  activeTab,
  onTabChange,
}: {
  readonly activeTab: Tab
  readonly onTabChange: (tab: Tab) => void
}) {
  const TAB_ICONS: Record<Tab, typeof BookOpen> = {
    Overview: BookOpen,
    Lessons: FileText,
    Schedule: Calendar,
    Enrollments: Users,
    Assignments: ClipboardList,
  }

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-0 -mb-px overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab]
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
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
  )
}

function OverviewTab({ course }: { readonly course: CourseData }) {
  const stats = [
    {
      label: "Lessons",
      value: course._count?.lessons ?? 0,
      icon: FileText,
      colorClass: "text-blue-700 bg-blue-50",
    },
    {
      label: "Enrollments",
      value: course._count?.enrollments ?? 0,
      icon: Users,
      colorClass: "text-indigo-700 bg-indigo-50",
    },
    {
      label: "Assignments",
      value: course._count?.assignments ?? 0,
      icon: ClipboardList,
      colorClass: "text-amber-600 bg-amber-50",
    },
    {
      label: "Status",
      value: course.isActive ? "Active" : "Inactive",
      icon: Clock,
      colorClass: course.isActive ? "text-emerald-600 bg-emerald-50" : "text-gray-500 bg-gray-50",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Course details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Course Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Title</p>
            <p className="font-medium text-gray-900 mt-0.5">{course.title}</p>
          </div>
          <div>
            <p className="text-gray-500">Slug</p>
            <p className="font-medium text-gray-900 mt-0.5 font-mono text-xs">{course.slug}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500">Description</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {course.description ?? "No description provided."}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {new Date(course.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {new Date(course.updatedAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LessonsTab({
  courseId,
  lessons,
  loading,
}: {
  readonly courseId: string
  readonly lessons: LessonItem[]
  readonly loading: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <FileText className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-600">No lessons yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Add your first lesson to get started with this course.
        </p>
        <Link
          href={`/admin/lessons?course=${courseId}`}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Lesson
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{lessons.length} lesson(s)</p>
        <Link
          href={`/admin/lessons?course=${courseId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Lesson
        </Link>
      </div>
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
              {lesson.order}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
              {lesson.durationMin != null && (
                <p className="text-xs text-gray-500">{lesson.durationMin} min</p>
              )}
            </div>
          </div>
          <span
            className={`text-xs font-medium rounded-full px-2 py-0.5 ${
              lesson.isPublished
                ? "text-emerald-700 bg-emerald-50"
                : "text-gray-500 bg-gray-100"
            }`}
          >
            {lesson.isPublished ? "Published" : "Draft"}
          </span>
        </div>
      ))}
    </div>
  )
}

function ScheduleTab({ courseId }: { readonly courseId: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Training Schedule</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              View and manage scheduled sessions for this course.
            </p>
          </div>
          <Link
            href={`/admin/schedules?course=${courseId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Calendar className="h-4 w-4" />
            View Schedules
          </Link>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">Schedule management</p>
          <p className="text-xs text-slate-400 mt-1">
            Click "View Schedules" above to manage sessions, batches, and cohorts for this course.
          </p>
        </div>
      </div>
    </div>
  )
}

function EnrollmentsTab({
  enrollments,
  loading,
}: {
  readonly enrollments: EnrollmentItem[]
  readonly loading: boolean
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <ComingSoonBanner
        feature="Enrollments"
        description="No students are enrolled in this course yet."
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => (
            <tr key={e.id} className="border-b border-gray-100 last:border-0">
              <td className="py-3 px-4 font-medium text-gray-900">{e.fullName}</td>
              <td className="py-3 px-4 text-gray-500">{e.email}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 text-blue-700 bg-blue-50">
                  {e.status}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-gray-500">
                {new Date(e.createdAt).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AssignmentsTab({ courseId }: { readonly courseId: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Course Assignments</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage assignments and review submissions for this course.
            </p>
          </div>
          <Link
            href={`/admin/assignments?course=${courseId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <ClipboardList className="h-4 w-4" />
            Manage Assignments
          </Link>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">Assignment management</p>
          <p className="text-xs text-slate-400 mt-1">
            Click "Manage Assignments" above to create and review assignments for this course.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [course, setCourse] = useState<CourseData | null>(null)
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [courseLoading, setCourseLoading] = useState(true)
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch course on mount
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/admin/courses/${id}`)
        const json = await res.json()
        if (!json.success) {
          setError(json.error ?? "Failed to load course")
        } else {
          setCourse(json.data)
        }
      } catch {
        setError("Failed to load course")
      } finally {
        setCourseLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  // Fetch lessons when tab is active
  useEffect(() => {
    if (activeTab !== "Lessons") return
    setLessonsLoading(true)
    fetch(`/api/admin/lessons?courseId=${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLessons(json.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLessonsLoading(false))
  }, [activeTab, id])

  // Fetch enrollments when tab is active
  useEffect(() => {
    if (activeTab !== "Enrollments") return
    setEnrollmentsLoading(true)
    fetch(`/api/admin/enrollments?courseId=${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setEnrollments(json.data ?? [])
      })
      .catch(() => {})
      .finally(() => setEnrollmentsLoading(false))
  }, [activeTab, id])

  if (courseLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-6 w-96 bg-slate-100 rounded animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error ?? "Course not found"}</p>
        <Link
          href="/admin/courses/list"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-red-600 hover:text-red-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/admin/courses/list"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {course.description ?? "No description"}
            </p>
          </div>
          <span
            className={`inline-flex items-center text-xs font-medium rounded-full px-3 py-1 self-start sm:self-auto ${
              course.isActive
                ? "text-emerald-700 bg-emerald-50"
                : "text-gray-500 bg-gray-100"
            }`}
          >
            {course.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Tab strip */}
      <TabStrip activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === "Overview" && <OverviewTab course={course} />}
      {activeTab === "Lessons" && (
        <LessonsTab courseId={id} lessons={lessons} loading={lessonsLoading} />
      )}
      {activeTab === "Schedule" && <ScheduleTab courseId={id} />}
      {activeTab === "Enrollments" && (
        <EnrollmentsTab enrollments={enrollments} loading={enrollmentsLoading} />
      )}
      {activeTab === "Assignments" && <AssignmentsTab courseId={id} />}
    </div>
  )
}
