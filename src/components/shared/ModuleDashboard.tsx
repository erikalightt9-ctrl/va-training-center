import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/shared/DashboardCard";
import type { DashboardCardProps } from "@/components/shared/DashboardCard";

export interface ModuleDashboardProps {
  /** Module display name shown as the page title */
  readonly title: string;
  /** Optional subtitle / description */
  readonly description?: string;
  /** Large icon rendered beside the title */
  readonly icon: React.ComponentType<{ className?: string }>;
  /** Color classes for the header icon e.g. "bg-blue-100 text-blue-700" */
  readonly iconColorClass?: string;
  /** Cards to display in the grid */
  readonly cards: ReadonlyArray<Omit<DashboardCardProps, "currentRole"> & { currentRole?: string }>;
  /** Role of the currently authenticated user — passed down to each card for gating */
  readonly currentRole?: string;
  /** Optional extra content rendered below the card grid (e.g. live stats strip) */
  readonly children?: React.ReactNode;
  /** Extra className for the root container */
  readonly className?: string;
}

/**
 * ModuleDashboard — the layout for every primary-module hub page.
 *
 * Renders a header (icon + title + description) followed by a responsive
 * card grid. Cards are role-filtered automatically via DashboardCard.
 *
 * Usage:
 * ```tsx
 * <ModuleDashboard title="Courses" icon={BookOpen} cards={courseCards} currentRole="admin" />
 * ```
 */
export function ModuleDashboard({
  title,
  description,
  icon: HeaderIcon,
  iconColorClass = "bg-blue-100 text-blue-700",
  cards,
  currentRole,
  children,
  className,
}: ModuleDashboardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <div className={cn("rounded-xl p-3 shrink-0", iconColorClass)}>
          <HeaderIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* ── Card Grid ── */}
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {cards.map((card) => (
          <DashboardCard
            key={card.href}
            {...card}
            currentRole={currentRole ?? card.currentRole}
          />
        ))}
      </div>

      {/* ── Optional extra content ── */}
      {children && <div>{children}</div>}
    </div>
  );
}
