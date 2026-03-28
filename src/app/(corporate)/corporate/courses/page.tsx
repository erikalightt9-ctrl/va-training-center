"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Users,
  Clock,
  Tag,
  Loader2,
  ExternalLink,
  Filter,
  GraduationCap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Course {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string | null;
  readonly thumbnailUrl: string | null;
  readonly tier: string | null;
  readonly duration: number | null;
  readonly status: string;
  readonly enrollmentCount: number;
  readonly trainerName: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TIER_COLOR: Record<string, string> = {
  BASIC:        "bg-gray-100 text-gray-700",
  PROFESSIONAL: "bg-blue-100 text-blue-700",
  ENTERPRISE:   "bg-purple-100 text-purple-700",
};

function formatDuration(mins: number | null): string {
  if (!mins) return "—";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* ------------------------------------------------------------------ */
/*  Course Card                                                        */
/* ------------------------------------------------------------------ */

function CourseCard({ course }: { readonly course: Course }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Thumbnail */}
      {course.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="h-36 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-blue-300" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Tier badge */}
        {course.tier && (
          <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${TIER_COLOR[course.tier] ?? "bg-gray-100 text-gray-600"}`}>
            {course.tier}
          </span>
        )}

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{course.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {course.enrollmentCount} enrolled
          </span>
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(course.duration)}
            </span>
          )}
          {course.trainerName && (
            <span className="flex items-center gap-1 ml-auto truncate">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span className="truncate">{course.trainerName}</span>
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Link
            href={`/corporate/enrollments?course=${course.id}`}
            className="flex-1 text-center text-xs font-medium bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enroll Team
          </Link>
          <Link
            href={`/programs/${course.slug}`}
            target="_blank"
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
            title="Preview course"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CorporateCoursesPage() {
  const [courses, setCourses] = useState<ReadonlyArray<Course>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/corporate/courses");
      const json = await r.json();
      if (json.success) setCourses(json.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const tiers = ["ALL", ...Array.from(new Set(courses.map((c) => c.tier).filter(Boolean) as string[]))];

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "ALL" || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Browse available courses and enroll your team members
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="flex gap-1.5">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  tierFilter === tier
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {tier === "ALL" ? "All Tiers" : tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" />
          {filtered.length} of {courses.length} courses
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {courses.reduce((a, c) => a + c.enrollmentCount, 0)} total enrollments
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search || tierFilter !== "ALL" ? "No courses match your filters" : "No courses available yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {search || tierFilter !== "ALL"
              ? "Try adjusting your search or filter"
              : "Courses will appear here once your platform admin adds them"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
