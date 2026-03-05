"use client";

import * as React from "react";
import { CalendarWidget } from "@/components/calendar/CalendarWidget";
import { UpcomingEvents } from "@/components/calendar/UpcomingEvents";
import type { CalendarItem } from "@/components/calendar/CalendarWidget";

interface StudentCalendarSectionProps {
  initialItems: ReadonlyArray<CalendarItem>;
}

export function StudentCalendarSection({ initialItems }: StudentCalendarSectionProps) {
  const [items, setItems] = React.useState<ReadonlyArray<CalendarItem>>(initialItems);
  const [month, setMonth] = React.useState(new Date());

  const fetchEvents = React.useCallback(async (date: Date) => {
    try {
      const year = date.getFullYear();
      const m = date.getMonth() + 1;
      const res = await fetch(`/api/student/calendar?year=${year}&month=${m}`);
      const data = await res.json();
      if (data.success && data.data) {
        setItems(
          data.data.map((e: Record<string, unknown>) => ({
            id: e.id as string,
            title: e.title as string,
            description: e.description as string | null,
            date: e.date as string,
            endDate: e.endDate as string | null,
            type: e.type as string,
            source: e.source as string,
          })),
        );
      }
    } catch (err) {
      console.error("[StudentCalendar] Failed to fetch events:", err);
    }
  }, []);

  function handleMonthChange(date: Date) {
    setMonth(date);
    fetchEvents(date);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CalendarWidget
        items={items}
        month={month}
        onMonthChange={handleMonthChange}
      />
      <UpcomingEvents items={items} />
    </div>
  );
}
