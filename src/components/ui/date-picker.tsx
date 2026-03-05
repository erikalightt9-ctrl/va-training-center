"use client";

import { useMemo, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DatePickerProps {
  /** Currently selected date */
  readonly value: Date | undefined;
  /** Called when the user picks a date */
  readonly onChange: (date: Date | undefined) => void;
  /** Placeholder text (unused — kept for backward compat) */
  readonly placeholder?: string;
  /** Earliest selectable date */
  readonly fromDate?: Date;
  /** Latest selectable date */
  readonly toDate?: Date;
  /** Additional className for the wrapper */
  readonly className?: string;
  /** Whether the picker is disabled */
  readonly disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DatePicker({
  value,
  onChange,
  fromDate,
  toDate,
  className = "",
  disabled = false,
}: DatePickerProps) {
  const today = useMemo(() => new Date(), []);
  const minYear = fromDate ? fromDate.getFullYear() : today.getFullYear() - 80;
  const maxYear = toDate ? toDate.getFullYear() : today.getFullYear();

  // Build year options (descending so most recent years show first)
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  // Build day options based on selected month/year
  const selectedMonth = value ? value.getMonth() : -1;
  const selectedYear = value ? value.getFullYear() : -1;
  const selectedDay = value ? value.getDate() : -1;

  const daysInMonth = useMemo(() => {
    if (selectedMonth < 0 || selectedYear < 0) return 31;
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const days = useMemo(() => {
    const list: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(d);
    }
    return list;
  }, [daysInMonth]);

  const buildDate = useCallback(
    (month: number, day: number, year: number): Date | undefined => {
      if (month < 0 || day < 0 || year < 0) return undefined;
      const maxDay = new Date(year, month + 1, 0).getDate();
      const safeDay = Math.min(day, maxDay);
      return new Date(year, month, safeDay);
    },
    [],
  );

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const m = parseInt(e.target.value, 10);
      if (isNaN(m)) {
        onChange(undefined);
        return;
      }
      onChange(buildDate(m, selectedDay > 0 ? selectedDay : 1, selectedYear > 0 ? selectedYear : maxYear));
    },
    [onChange, buildDate, selectedDay, selectedYear, maxYear],
  );

  const handleDayChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const d = parseInt(e.target.value, 10);
      if (isNaN(d)) {
        onChange(undefined);
        return;
      }
      onChange(buildDate(selectedMonth > -1 ? selectedMonth : 0, d, selectedYear > 0 ? selectedYear : maxYear));
    },
    [onChange, buildDate, selectedMonth, selectedYear, maxYear],
  );

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const y = parseInt(e.target.value, 10);
      if (isNaN(y)) {
        onChange(undefined);
        return;
      }
      onChange(buildDate(selectedMonth > -1 ? selectedMonth : 0, selectedDay > 0 ? selectedDay : 1, y));
    },
    [onChange, buildDate, selectedMonth, selectedDay],
  );

  const selectBase =
    "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
    "disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer";

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {/* Month */}
      <select
        value={selectedMonth > -1 ? selectedMonth : ""}
        onChange={handleMonthChange}
        disabled={disabled}
        className={selectBase}
        aria-label="Month"
      >
        <option value="" disabled>
          Month
        </option>
        {MONTHS.map((name, i) => (
          <option key={name} value={i}>
            {name}
          </option>
        ))}
      </select>

      {/* Day */}
      <select
        value={selectedDay > 0 ? selectedDay : ""}
        onChange={handleDayChange}
        disabled={disabled}
        className={selectBase}
        aria-label="Day"
      >
        <option value="" disabled>
          Day
        </option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {/* Year */}
      <select
        value={selectedYear > 0 ? selectedYear : ""}
        onChange={handleYearChange}
        disabled={disabled}
        className={selectBase}
        aria-label="Year"
      >
        <option value="" disabled>
          Year
        </option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
