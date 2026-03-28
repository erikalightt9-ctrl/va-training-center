/**
 * Feature State Configuration
 *
 * Controls the visibility and UI state of every module in the corporate portal.
 *
 * States:
 *   live    — Fully functional. Rendered as a normal clickable card/link.
 *   beta    — Partially functional. Shows a "Beta" badge; still clickable.
 *   planned — Not yet implemented. Non-clickable with lock icon + "Coming Soon" tooltip.
 *
 * This is distinct from per-tenant feature flags (TenantFeatureFlag in DB).
 * Feature states are platform-wide and controlled by the engineering team.
 * Tenant feature flags further gate access on top of these states.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeatureState = "live" | "beta" | "planned";

export interface ModuleFeature {
  /** URL path used in the corporate portal */
  readonly href: string;
  /** Human-readable module name */
  readonly label: string;
  /** Current readiness state */
  readonly state: FeatureState;
  /** Optional: tooltip shown on "planned" or "beta" items */
  readonly tooltip?: string;
}

// ─── Module State Registry ─────────────────────────────────────────────────────
//
// Priority tiers:
//   Core       → always live (courses, employees, enrollments, tasks, dashboard)
//   Secondary  → beta (trainers, calendar, reports)
//   Advanced   → planned (ai-tools, files, website, messages, announcements, support)

export const MODULE_STATES: ReadonlyArray<ModuleFeature> = [
  // ── Core (always live) ──────────────────────────────────────────────────────
  {
    href: "/corporate/dashboard",
    label: "Dashboard",
    state: "live",
  },
  {
    href: "/corporate/employees",
    label: "Team",
    state: "live",
  },
  {
    href: "/corporate/courses",
    label: "Courses",
    state: "live",
  },
  {
    href: "/corporate/enrollments",
    label: "Enrollments",
    state: "live",
  },
  {
    href: "/corporate/tasks",
    label: "Tasks",
    state: "live",
  },
  {
    href: "/corporate/settings",
    label: "Settings",
    state: "live",
  },

  // ── Secondary (beta) ────────────────────────────────────────────────────────
  {
    href: "/corporate/trainers",
    label: "Trainers",
    state: "beta",
    tooltip: "Trainer management is in beta. Some features may change.",
  },
  {
    href: "/corporate/calendar",
    label: "Calendar",
    state: "beta",
    tooltip: "Calendar is in beta. Events are synced from tasks with due dates.",
  },
  {
    href: "/corporate/reports",
    label: "Reports",
    state: "beta",
    tooltip: "Reporting is in beta. Export formats coming soon.",
  },

  // ── Advanced (planned) ──────────────────────────────────────────────────────
  {
    href: "/corporate/ai-tools",
    label: "AI Tools",
    state: "planned",
    tooltip: "AI Tools are coming soon. This module is currently under development.",
  },
  {
    href: "/corporate/files",
    label: "Files",
    state: "planned",
    tooltip: "File Manager is coming soon. Document storage will be available shortly.",
  },
  {
    href: "/corporate/website",
    label: "Website",
    state: "planned",
    tooltip: "Website builder is coming soon. Custom portal branding is in progress.",
  },
  {
    href: "/corporate/messages",
    label: "Messages",
    state: "planned",
    tooltip: "Internal messaging is coming soon.",
  },
  {
    href: "/corporate/announcements",
    label: "Announcements",
    state: "planned",
    tooltip: "Announcements module is coming soon.",
  },
  {
    href: "/corporate/support",
    label: "Support",
    state: "planned",
    tooltip: "Support ticketing is coming soon.",
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const _stateMap = new Map<string, FeatureState>(
  MODULE_STATES.map((m) => [m.href, m.state]),
);

const _tooltipMap = new Map<string, string | undefined>(
  MODULE_STATES.map((m) => [m.href, m.tooltip]),
);

/**
 * Returns the feature state for a given href.
 * Defaults to "live" for unknown routes (e.g. sub-paths).
 */
export function getModuleState(href: string): FeatureState {
  // Check exact match first, then prefix match for sub-paths
  if (_stateMap.has(href)) return _stateMap.get(href)!;
  for (const [key, state] of _stateMap) {
    if (href.startsWith(key + "/")) return state;
  }
  return "live";
}

/** Returns the tooltip for a module href, if any. */
export function getModuleTooltip(href: string): string | undefined {
  return _tooltipMap.get(href);
}

/** Returns true if the module at `href` is accessible (live or beta). */
export function isModuleAccessible(href: string): boolean {
  return getModuleState(href) !== "planned";
}
