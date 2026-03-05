"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { EngagementBadge } from "@/components/admin/EngagementBadge";
import type {
  StudentEngagementRow,
  StudentEngagementResponse,
  StudentSortField,
  SortOrder,
} from "@/lib/types/engagement.types";

interface CourseOption {
  readonly id: string;
  readonly title: string;
}

interface StudentEngagementTableProps {
  readonly courses: ReadonlyArray<CourseOption>;
}

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

interface TableState {
  readonly courseId: string;
  readonly search: string;
  readonly sortBy: StudentSortField;
  readonly sortOrder: SortOrder;
  readonly page: number;
}

const INITIAL_STATE: TableState = {
  courseId: "",
  search: "",
  sortBy: "studentName",
  sortOrder: "asc",
  page: 1,
};

interface Column {
  readonly key: StudentSortField | "engagementStatus";
  readonly label: string;
  readonly sortable: boolean;
}

const COLUMNS: ReadonlyArray<Column> = [
  { key: "studentName", label: "Student Name", sortable: true },
  { key: "lessonsCompleted", label: "Lessons", sortable: true },
  { key: "quizAvgScore", label: "Quiz Avg", sortable: true },
  { key: "assignmentsSubmitted", label: "Assignments", sortable: true },
  { key: "forumPosts", label: "Forum Posts", sortable: true },
  { key: "lastActiveAt", label: "Last Active", sortable: true },
  { key: "totalPoints", label: "Points", sortable: true },
  { key: "engagementStatus", label: "Status", sortable: false },
];

function formatLastActive(date: Date | string | null): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudentEngagementTable({
  courses,
}: StudentEngagementTableProps) {
  const [state, setState] = useState<TableState>(INITIAL_STATE);
  const [localSearch, setLocalSearch] = useState("");
  const [data, setData] = useState<StudentEngagementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (params: TableState) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams({
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        page: String(params.page),
        limit: String(PAGE_SIZE),
      });
      if (params.courseId) searchParams.set("courseId", params.courseId);
      if (params.search) searchParams.set("search", params.search);

      const response = await fetch(
        `/api/admin/engagement?${searchParams.toString()}`
      );
      const json = await response.json();

      if (!json.success) {
        setError(json.error ?? "Failed to load data");
        return;
      }
      setData(json.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(state);
  }, [state, fetchData]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleSearchInput = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setState((prev) => ({ ...prev, search: value.trim(), page: 1 }));
      }, DEBOUNCE_MS);
    },
    []
  );

  const handleCourseChange = useCallback((courseId: string) => {
    setState((prev) => ({ ...prev, courseId, page: 1 }));
  }, []);

  const handleSort = useCallback((field: StudentSortField) => {
    setState((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={state.courseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by course"
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name..."
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search students"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key as StudentSortField)}
                      className="inline-flex items-center gap-1 hover:text-gray-900"
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  Loading student data...
                </td>
              </tr>
            ) : !data || data.students.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No students found.
                </td>
              </tr>
            ) : (
              data.students.map((student: StudentEngagementRow) => (
                <tr
                  key={`${student.studentId}-${student.courseId}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.studentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.courseTitle}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.lessonsCompleted}/{student.totalLessons}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.quizAvgScore !== null
                      ? `${student.quizAvgScore}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.assignmentsSubmitted}/{student.totalAssignments}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {student.forumPosts}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatLastActive(student.lastActiveAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {student.totalPoints}
                  </td>
                  <td className="px-4 py-3">
                    <EngagementBadge status={student.engagementStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(state.page - 1) * PAGE_SIZE + 1}–
            {Math.min(state.page * PAGE_SIZE, data?.total ?? 0)} of{" "}
            {data?.total ?? 0}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(state.page - 1)}
              disabled={state.page <= 1}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {state.page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(state.page + 1)}
              disabled={state.page >= totalPages}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
