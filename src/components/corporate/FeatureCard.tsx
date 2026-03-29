"use client";

import Link from "next/link";
import { Lock, ArrowRight, FlaskConical } from "lucide-react";
import { getModuleState, getModuleTooltip } from "@/lib/feature-states";
import type { FeatureState } from "@/lib/feature-states";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureCardProps {
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly description: string;
  readonly color: string;
  readonly badge?: string | number;
  /** Override the state derived from href (optional). */
  readonly stateOverride?: FeatureState;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StateBadge({ state, tooltip }: { readonly state: FeatureState; readonly tooltip?: string }) {
  if (state === "live") return null;

  if (state === "beta") {
    return (
      <span
        title={tooltip}
        className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full"
      >
        <FlaskConical className="h-2.5 w-2.5" />
        Beta
      </span>
    );
  }

  // planned
  return (
    <span
      title={tooltip ?? "Coming soon"}
      className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded-full"
    >
      <Lock className="h-2.5 w-2.5" />
      Soon
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FeatureCard wraps each module hub card with state-aware rendering:
 *
 *   live    → Normal clickable card (same as before).
 *   beta    → Clickable card with amber "Beta" badge.
 *   planned → Non-clickable, visually muted, lock icon + "Coming Soon" tooltip.
 */
export function FeatureCard({
  href,
  icon: Icon,
  label,
  description,
  color,
  badge,
  stateOverride,
}: FeatureCardProps) {
  const state = stateOverride ?? getModuleState(href);
  const tooltip = getModuleTooltip(href);

  const iconBlock = (
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
  );

  const badgeBlock = badge !== undefined && state !== "planned" ? (
    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
      {badge}
    </span>
  ) : null;

  const stateBadge = <StateBadge state={state} tooltip={tooltip} />;

  // ── Planned (non-clickable) ──────────────────────────────────────────────
  if (state === "planned") {
    return (
      <div
        title={tooltip ?? "Coming soon — this module is in development"}
        className="relative bg-white rounded-xl border border-dashed border-gray-200 p-5 flex flex-col gap-3 opacity-60 cursor-not-allowed select-none"
      >
        {/* Subtle lock overlay */}
        <div className="absolute inset-0 rounded-xl" aria-hidden />
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${color} opacity-50`}>
            <Icon className="h-5 w-5" />
          </div>
          {stateBadge}
        </div>
        <div>
          <p className="font-semibold text-gray-400">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-auto">
          <Lock className="h-3 w-3" />
          Coming Soon
        </div>
      </div>
    );
  }

  // ── Live or Beta (clickable) ─────────────────────────────────────────────
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between">
        {iconBlock}
        <div className="flex items-center gap-1.5">
          {badgeBlock}
          {stateBadge}
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
        Open <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
