"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  BookOpen,
  CheckSquare,
  Bell,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type EventType = "SESSION" | "DEADLINE" | "TASK" | "ANNOUNCEMENT";

interface CalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly type: EventType;
  readonly date: string; // ISO date string
  readonly time: string | null;
  readonly description: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG: Record<EventType, { color: string; bg: string; icon: React.ReactNode }> = {
  SESSION:      { color: "text-blue-700",   bg: "bg-blue-100",   icon: <BookOpen   className="h-3 w-3" /> },
  DEADLINE:     { color: "text-red-700",    bg: "bg-red-100",    icon: <Clock      className="h-3 w-3" /> },
  TASK:         { color: "text-orange-700", bg: "bg-orange-100", icon: <CheckSquare className="h-3 w-3" /> },
  ANNOUNCEMENT: { color: "text-purple-700", bg: "bg-purple-100", icon: <Bell       className="h-3 w-3" /> },
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CorporateCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [events, setEvents] = useState<ReadonlyArray<CalendarEvent>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/corporate/calendar?year=${year}&month=${month + 1}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setEvents(json.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);

  // Group events by date key
  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const key = ev.date.substring(0, 10);
    return { ...acc, [key]: [...(acc[key] ?? []), ev] };
  }, {});

  const selectedKey = selectedDay ? toDateKey(year, month, selectedDay) : null;
  const selectedEvents = selectedKey ? (eventsByDate[selectedKey] ?? []) : [];

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">Sessions, deadlines, and team events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-base font-semibold text-gray-900">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-2">
            {DOW.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const key = toDateKey(year, month, day);
              const dayEvents = eventsByDate[key] ?? [];
              const isToday = key === todayKey;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative p-1.5 rounded-lg text-center min-h-[52px] transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="text-sm">{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected ? "bg-white/70" : TYPE_CONFIG[ev.type].bg.replace("bg-", "bg-")
                          }`}
                          style={{
                            backgroundColor: isSelected ? "rgba(255,255,255,0.7)" :
                              ev.type === "SESSION" ? "#3b82f6" :
                              ev.type === "DEADLINE" ? "#ef4444" :
                              ev.type === "TASK" ? "#f97316" : "#a855f7",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedDay
              ? `${MONTHS[month]} ${selectedDay}`
              : "Select a day"}
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : selectedEvents.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No events this day</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedEvents.map((ev) => {
                const cfg = TYPE_CONFIG[ev.type];
                return (
                  <div key={ev.id} className={`rounded-lg p-3 ${cfg.bg}`}>
                    <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${cfg.color}`}>
                      {cfg.icon}
                      {ev.type}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                    {ev.time && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {ev.time}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <p className="text-xs font-medium text-gray-400 mb-2">Legend</p>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`flex items-center gap-1 ${cfg.color}`}>{cfg.icon}</span>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
