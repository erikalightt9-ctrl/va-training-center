import type { ScheduleStatus } from "@prisma/client";

const STATUS_CONFIG: Record<ScheduleStatus, { label: string; className: string }> = {
  OPEN: {
    label: "Open",
    className: "bg-green-100 text-green-700",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-gray-100 text-gray-600",
  },
  FULL: {
    label: "Full",
    className: "bg-amber-100 text-amber-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700",
  },
};

interface ScheduleStatusBadgeProps {
  readonly status: ScheduleStatus;
}

export function ScheduleStatusBadge({ status }: ScheduleStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
