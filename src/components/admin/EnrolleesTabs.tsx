"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ClipboardList, Users } from "lucide-react";
import { EnrolleesTable } from "./EnrolleesTable";
import { EnrolleeManagementTable } from "./EnrolleeManagementTable";
import { FilterBar } from "./FilterBar";
import { EnrolleeFilters } from "./EnrolleeFilters";
import { Pagination } from "./Pagination";
import type { EnrollmentWithCourse } from "@/lib/repositories/enrollment.repository";
import type { EnrolleeWithCourse } from "@/lib/repositories/enrollee.repository";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TabKey = "applications" | "enrollees";

interface ApplicationsPaginated {
  readonly data: EnrollmentWithCourse[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

interface EnrolleesPaginated {
  readonly data: EnrolleeWithCourse[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

interface EnrolleesTabsProps {
  readonly applications: ApplicationsPaginated;
  readonly enrollees: EnrolleesPaginated;
}

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const TABS: ReadonlyArray<{
  readonly key: TabKey;
  readonly label: string;
  readonly icon: typeof Users;
}> = [
  { key: "applications", label: "Applications", icon: ClipboardList },
  { key: "enrollees", label: "Active Enrollees", icon: Users },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EnrolleesTabs({ applications, enrollees }: EnrolleesTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = (searchParams.get("tab") as TabKey) ?? "applications";

  function switchTab(tab: TabKey) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-6" aria-label="Enrollees tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tab.key === "applications" ? applications.total : enrollees.total;
            return (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "applications" && (
        <>
          <FilterBar />
          <EnrolleesTable enrollments={applications.data} />
          {applications.totalPages > 1 && (
            <Pagination
              page={applications.page}
              totalPages={applications.totalPages}
              total={applications.total}
              limit={applications.limit}
            />
          )}
        </>
      )}

      {activeTab === "enrollees" && (
        <>
          <EnrolleeFilters />
          <EnrolleeManagementTable enrollees={enrollees.data} />
          {enrollees.totalPages > 1 && (
            <Pagination
              page={enrollees.page}
              totalPages={enrollees.totalPages}
              total={enrollees.total}
              limit={enrollees.limit}
            />
          )}
        </>
      )}
    </>
  );
}
