"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ChatWidgetEnhanced } from "@/components/shared/ChatWidgetEnhanced";

// ---------------------------------------------------------------------------
// Primary module nav — flat, no dropdowns/submenus
// ---------------------------------------------------------------------------

interface PrimaryNavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  /** Match rule: "exact" | "prefix" (default prefix) */
  readonly match?: "exact" | "prefix";
}

const PRIMARY_NAV: ReadonlyArray<PrimaryNavItem> = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard, match: "exact" },
  { href: "/admin/courses",  label: "Courses",   icon: BookOpen },
  { href: "/admin/students", label: "Students",  icon: Users },
  { href: "/admin/tasks",    label: "Tasks",     icon: ClipboardList },
  { href: "/admin/reports",  label: "Reports",   icon: BarChart3 },
];

const BOTTOM_NAV: ReadonlyArray<PrimaryNavItem> = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(item: PrimaryNavItem) {
    if (item.match === "exact") return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-56 bg-blue-950 text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-blue-800">
          <div className="flex items-center gap-2 font-bold text-base">
            <GraduationCap className="h-5 w-5 text-blue-400 shrink-0" />
            <span>HUMI Admin</span>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
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
            const active = isActive(item);
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

          <a
            href="/api/admin/export"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <Download className="h-4 w-4 shrink-0" />
            Export CSV
          </a>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-blue-200 hover:bg-blue-800 hover:text-white gap-3 px-3"
            onClick={() => signOut({ callbackUrl: "/portal?tab=admin" })}
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

      <ChatWidgetEnhanced role="admin" currentPage={pathname} />
    </div>
  );
}
