"use client";

import { useState, useMemo } from "react";
import {
  Star,
  Filter,
  ArrowUpDown,
  MessageSquare,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FeedbackCategory =
  | "COMMUNICATION"
  | "TECHNICAL_SKILLS"
  | "PROFESSIONALISM"
  | "RELIABILITY"
  | "PROBLEM_SOLVING"
  | "OVERALL";

interface FeedbackItem {
  readonly id: string;
  readonly reviewerName: string;
  readonly reviewerRole: string;
  readonly category: FeedbackCategory;
  readonly rating: number;
  readonly feedback: string;
  readonly createdAt: string;
}

interface EmployerFeedbackListProps {
  readonly feedback: ReadonlyArray<FeedbackItem>;
}

type SortOrder = "newest" | "oldest";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_CONFIG: Record<
  FeedbackCategory,
  { readonly label: string; readonly color: string }
> = {
  COMMUNICATION: { label: "Communication", color: "bg-blue-100 text-blue-700" },
  TECHNICAL_SKILLS: {
    label: "Technical Skills",
    color: "bg-purple-100 text-purple-700",
  },
  PROFESSIONALISM: {
    label: "Professionalism",
    color: "bg-amber-100 text-amber-700",
  },
  RELIABILITY: { label: "Reliability", color: "bg-green-100 text-green-700" },
  PROBLEM_SOLVING: {
    label: "Problem Solving",
    color: "bg-red-100 text-red-700",
  },
  OVERALL: { label: "Overall", color: "bg-gray-100 text-gray-700" },
};

const ALL_CATEGORIES: ReadonlyArray<FeedbackCategory> = [
  "COMMUNICATION",
  "TECHNICAL_SKILLS",
  "PROFESSIONALISM",
  "RELIABILITY",
  "PROBLEM_SOLVING",
  "OVERALL",
];

/* ------------------------------------------------------------------ */
/*  Star Rating                                                        */
/* ------------------------------------------------------------------ */

function StarRating({ rating }: { readonly rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EmployerFeedbackList({ feedback }: EmployerFeedbackListProps) {
  const [categoryFilter, setCategoryFilter] = useState<
    FeedbackCategory | "ALL"
  >("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const filtered = useMemo(() => {
    const items =
      categoryFilter === "ALL"
        ? [...feedback]
        : feedback.filter((f) => f.category === categoryFilter);

    return items.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [feedback, categoryFilter, sortOrder]);

  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">
          No employer feedback yet.
        </p>
        <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
          Feedback from employers and clients will appear here as you
          complete real-world projects.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as FeedbackCategory | "ALL")
            }
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_CONFIG[cat].label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Feedback Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">
            No feedback matches the selected category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const cat = CATEGORY_CONFIG[item.category];
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {item.reviewerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.reviewerRole}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}
                  >
                    {cat.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <StarRating rating={item.rating} />
                  <span className="text-xs text-gray-400">
                    {item.rating}/5
                  </span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {item.feedback}
                </p>

                <p className="text-xs text-gray-400 mt-3">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
