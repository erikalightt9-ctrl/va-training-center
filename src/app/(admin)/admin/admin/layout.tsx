"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Dashboard",            href: "/admin/admin" },
  { label: "Car Maintenance & Fuel", href: "/admin/admin/car-maintenance" },
  { label: "Pantry Inventory",     href: "/admin/admin/pantry" },
  { label: "Maintenance Inventory", href: "/admin/admin/maintenance" },
  { label: "Repair Logs",          href: "/admin/admin/repair-logs" },
  { label: "Suppliers",            href: "/admin/admin/suppliers" },
  { label: "Equipment",            href: "/admin/admin/equipment" },
  { label: "Assets",               href: "/admin/admin/assets" },
];

export default function AdminDeptLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/admin") return pathname === "/admin/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white border-b border-slate-200">
        <div className="px-6">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Admin Dept navigation">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${isActive(tab.href)
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex-1 bg-slate-50">{children}</div>
    </div>
  );
}
