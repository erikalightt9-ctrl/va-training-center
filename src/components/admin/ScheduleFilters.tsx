"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "FULL", label: "Full" },
  { value: "COMPLETED", label: "Completed" },
] as const;

const COURSES = [
  { value: "", label: "All Programs" },
  { value: "MEDICAL_VA", label: "Medical VA" },
  { value: "REAL_ESTATE_VA", label: "Real Estate VA" },
  { value: "US_BOOKKEEPING_VA", label: "US Bookkeeping VA" },
] as const;

export function ScheduleFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input
        placeholder="Search by name..."
        defaultValue={searchParams.get("search") ?? ""}
        className="w-56"
        onChange={(e) => {
          const timer = setTimeout(() => updateParam("search", e.target.value), 400);
          return () => clearTimeout(timer);
        }}
      />

      <select
        className="h-9 rounded-md border border-gray-200 px-3 text-sm bg-white"
        defaultValue={searchParams.get("courseSlug") ?? ""}
        onChange={(e) => updateParam("courseSlug", e.target.value)}
      >
        {COURSES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border border-gray-200 px-3 text-sm bg-white"
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
