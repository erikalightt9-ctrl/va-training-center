"use client";

import { cn } from "@/lib/utils";
import type { EngagementStatus } from "@/lib/types/engagement.types";

interface EngagementBadgeProps {
  readonly status: EngagementStatus;
}

const BADGE_CONFIG: Record<
  EngagementStatus,
  { readonly label: string; readonly className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-amber-100 text-amber-800",
  },
  inactive: {
    label: "Inactive",
    className: "bg-red-100 text-red-800",
  },
};

export function EngagementBadge({ status }: EngagementBadgeProps) {
  const config = BADGE_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
