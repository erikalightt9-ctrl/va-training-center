"use client";

import * as React from "react";
import { formatDistanceToNow, format, isToday, isTomorrow } from "date-fns";
import type { CalendarItem } from "./CalendarWidget";

// ── Types ──────────────────────────────────────────────────────────
interface UpcomingEventsProps {
  items: ReadonlyArray<CalendarItem>;
  maxItems?: number;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

// ── Color & label maps ─────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  ANNOUNCEMENT: "bg-blue-100 text-blue-700",
  DEADLINE: "bg-red-100 text-red-700",
  ORIENTATION: "bg-green-100 text-green-700",
  HOLIDAY: "bg-amber-100 text-amber-700",
  CUSTOM: "bg-gray-100 text-gray-700",
  ASSIGNMENT: "bg-purple-100 text-purple-700",
};

const TYPE_DOT: Record<string, string> = {
  ANNOUNCEMENT: "bg-blue-500",
  DEADLINE: "bg-red-500",
  ORIENTATION: "bg-green-500",
  HOLIDAY: "bg-amber-500",
  CUSTOM: "bg-gray-500",
  ASSIGNMENT: "bg-purple-500",
};

const TYPE_LABELS: Record<string, string> = {
  ANNOUNCEMENT: "Announcement",
  DEADLINE: "Deadline",
  ORIENTATION: "Orientation",
  HOLIDAY: "Holiday",
  CUSTOM: "Event",
  ASSIGNMENT: "Assignment",
};

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";

  const distance = formatDistanceToNow(date, { addSuffix: true });
  // If within 7 days, show relative; otherwise show date
  const diffDays = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (diffDays > 0 && diffDays <= 7) return distance;
  return format(date, "MMM d");
}

// ── Component ──────────────────────────────────────────────────────
export function UpcomingEvents({
  items,
  maxItems = 7,
  showAddButton = false,
  onAddClick,
}: UpcomingEventsProps) {
  // Filter to future or today items, sort by date, limit
  const upcoming = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items
      .filter((item) => new Date(item.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, maxItems);
  }, [items, maxItems]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
        {showAddButton && (
          <button
            onClick={onAddClick}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            + Add Event
          </button>
        )}
      </div>

      {upcoming.length > 0 ? (
        <div className="space-y-3">
          {upcoming.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[item.type] ?? "bg-gray-400"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[item.type] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatEventDate(item.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">
          No upcoming events
        </p>
      )}
    </div>
  );
}
