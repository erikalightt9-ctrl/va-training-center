"use client"
import { useState } from "react"
import Link from "next/link"
import {
  Users,
  ClipboardList,
  FileText,
  ExternalLink,
  Download,
} from "lucide-react"
import { EnrolleesTabs } from "@/components/admin/EnrolleesTabs"
import type { EnrollmentWithCourse } from "@/lib/repositories/enrollment.repository"
import type { EnrolleeWithCourse } from "@/lib/repositories/enrollee.repository"

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ApplicationsPaginated {
  readonly data: EnrollmentWithCourse[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly totalPages: number
}

interface EnrolleesPaginated {
  readonly data: EnrolleeWithCourse[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly totalPages: number
}

interface TasksPageTabsProps {
  readonly applications: ApplicationsPaginated
  readonly enrollees: EnrolleesPaginated
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                     */
/* ------------------------------------------------------------------ */

const OUTER_TABS = ["Enrollments", "Assignments", "Submissions"] as const
type OuterTab = (typeof OUTER_TABS)[number]

const OUTER_TAB_ICONS: Record<OuterTab, typeof Users> = {
  Enrollments: Users,
  Assignments: ClipboardList,
  Submissions: FileText,
}

/* ------------------------------------------------------------------ */
/*  Quick-link card                                                     */
/* ------------------------------------------------------------------ */

function QuickLinkCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  readonly title: string
  readonly description: string
  readonly href: string
  readonly icon: typeof ExternalLink
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-indigo-700" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

export function TasksPageTabs({ applications, enrollees }: TasksPageTabsProps) {
  const [activeTab, setActiveTab] = useState<OuterTab>("Enrollments")

  return (
    <div>
      {/* Outer tab strip */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {OUTER_TABS.map((tab) => {
            const Icon = OUTER_TAB_ICONS[tab]
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

      {/* Enrollments tab — existing content */}
      {activeTab === "Enrollments" && (
        <EnrolleesTabs applications={applications} enrollees={enrollees} />
      )}

      {/* Assignments tab */}
      {activeTab === "Assignments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Assignments</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Create and review course assignments across all students.
              </p>
            </div>
            <Link
              href="/admin/assignments"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              Manage Assignments
            </Link>
          </div>
          <QuickLinkCard
            title="All Assignments"
            description="View, create, and manage assignments for all courses and students."
            href="/admin/assignments"
            icon={ClipboardList}
          />
          <QuickLinkCard
            title="Assignment Submissions"
            description="Review student submissions and provide grades and feedback."
            href="/admin/submissions"
            icon={FileText}
          />
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center mt-4">
            <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Assignment overview coming soon</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              An embedded assignment list will appear here. Use the links above to manage assignments now.
            </p>
          </div>
        </div>
      )}

      {/* Submissions tab */}
      {activeTab === "Submissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Submissions</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Review and grade student assignment submissions.
              </p>
            </div>
            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              Open Submissions
            </Link>
          </div>
          <QuickLinkCard
            title="All Submissions"
            description="Grade pending submissions, view scores, and leave feedback for students."
            href="/admin/submissions"
            icon={FileText}
          />
          <QuickLinkCard
            title="Export Submissions"
            description="Download a CSV of all submissions for reporting purposes."
            href="/api/admin/export"
            icon={Download}
          />
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center mt-4">
            <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Inline submission review coming soon</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              An embedded grader will appear here. Use the links above to manage submissions now.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
