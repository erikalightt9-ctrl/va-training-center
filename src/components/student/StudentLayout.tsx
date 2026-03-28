"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Briefcase,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ChatWidgetEnhanced } from "@/components/shared/ChatWidgetEnhanced";

// ---------------------------------------------------------------------------
// Primary module nav — flat, no dropdowns/submenus
// ---------------------------------------------------------------------------

interface PrimaryNavItem {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly match?: "exact" | "prefix";
  /** href may be static or built from courseId */
  readonly buildHref: (courseId: string) => string;
}

const PRIMARY_NAV: ReadonlyArray<PrimaryNavItem> = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    match: "exact",
    buildHref: () => "/student/dashboard",
  },
  {
    label: "My Course",
    icon: BookOpen,
    buildHref: (id) => `/student/courses/${id}`,
  },
  {
    label: "AI Lab",
    icon: Sparkles,
    buildHref: () => "/student/ai-lab",
  },
  {
    label: "Career",
    icon: Briefcase,
    buildHref: () => "/student/career",
  },
  {
    label: "Progress",
    icon: BarChart3,
    buildHref: () => "/student/progress",
  },
];

interface BottomNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const BOTTOM_NAV: ReadonlyArray<BottomNavItem> = [
  { href: "/student/profile",  label: "Profile",  icon: UserCircle },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

interface StudentLayoutProps {
  readonly courseId: string;
  readonly children: React.ReactNode;
}

export function StudentLayout({ courseId, children }: StudentLayoutProps) {
  const pathname = usePathname();

  function isActive(item: PrimaryNavItem) {
    const href = item.buildHref(courseId);
    if (item.match === "exact") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isBottomActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-56 bg-blue-950 text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-blue-800">
          <div className="flex items-center gap-2 font-bold text-base">
            <GraduationCap className="h-5 w-5 text-blue-400 shrink-0" />
            <span>HUMI Student</span>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {PRIMARY_NAV.map((item) => {
            const href = item.buildHref(courseId);
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-700 text-white"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom utilities */}
        <div className="px-3 py-4 border-t border-blue-800 space-y-1">
          {BOTTOM_NAV.map((item) => {
            const active = isBottomActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-700 text-white"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-blue-200 hover:bg-blue-800 hover:text-white gap-3 px-3"
            onClick={() => signOut({ callbackUrl: "/student/login" })}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-end px-8 py-3 border-b border-gray-200 bg-white shrink-0">
          <NotificationBell />
        </div>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>

      <ChatWidgetEnhanced role="student" currentPage={pathname} />
    </div>
  );
}
