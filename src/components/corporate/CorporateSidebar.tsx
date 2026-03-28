"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Globe,
  CheckSquare,
  CalendarDays,
  Sparkles,
  FolderOpen,
  MessageSquare,
  Bell,
  Headphones,
  BookOpen,
  Lock,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getModuleState } from "@/lib/feature-states";

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly match?: "exact";
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { href: "/corporate/dashboard",     label: "Dashboard",     icon: LayoutDashboard, match: "exact" },
  { href: "/corporate/employees",     label: "Team",          icon: Users },
  { href: "/corporate/courses",       label: "Courses",       icon: BookOpen },
  { href: "/corporate/enrollments",   label: "Enrollments",   icon: ClipboardList },
  { href: "/corporate/trainers",      label: "Trainers",      icon: GraduationCap },
  { href: "/corporate/tasks",         label: "Tasks",         icon: CheckSquare },
  { href: "/corporate/calendar",      label: "Calendar",      icon: CalendarDays },
  { href: "/corporate/reports",       label: "Reports",       icon: BarChart3 },
  { href: "/corporate/ai-tools",      label: "AI Tools",      icon: Sparkles },
  { href: "/corporate/files",         label: "Files",         icon: FolderOpen },
  { href: "/corporate/website",       label: "Website",       icon: Globe },
  { href: "/corporate/messages",      label: "Messages",      icon: MessageSquare },
  { href: "/corporate/announcements", label: "Announcements", icon: Bell },
  { href: "/corporate/support",       label: "Support",       icon: Headphones },
  { href: "/corporate/settings",      label: "Settings",      icon: Settings },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CorporateSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string; organizationId?: string }
    | undefined;

  function isActive(item: NavItem) {
    if (item.match === "exact") return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <aside className="w-56 bg-slate-900 text-white flex flex-col shrink-0 h-screen">
      {/* Logo area */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2 font-bold text-base">
          <GraduationCap className="h-5 w-5 text-blue-400 shrink-0" />
          <span>HUMI Corporate</span>
        </div>
      </div>

      {/* User badge */}
      {user && (
        <div className="px-4 py-2.5 border-b border-slate-800">
          <p className="text-xs font-medium text-slate-300 truncate">
            {user.name ?? user.email ?? "Corporate Manager"}
          </p>
          {user.email && (
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          )}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const state = getModuleState(item.href);

          // Planned items: non-clickable, muted, lock icon
          if (state === "planned") {
            return (
              <div
                key={item.href}
                title="Coming soon"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed select-none"
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-50" />
                <span className="flex-1 opacity-50">{item.label}</span>
                <Lock className="h-3 w-3 opacity-40" />
              </div>
            );
          }

          // Beta items: clickable with small amber badge
          if (state === "beta") {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <FlaskConical className="h-3 w-3 opacity-60 text-amber-400" />
              </Link>
            );
          }

          // Live items: normal
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white gap-3 px-3"
          onClick={() => signOut({ callbackUrl: "/corporate/login" })}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
