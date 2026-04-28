"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package, Truck, ShoppingCart, Laptop, Briefcase,
  Building2, DollarSign, BarChart3,
} from "lucide-react";

const TABS = [
  { label: "Inventory",   href: "/admin/admin/inventory",   icon: Package    },
  { label: "Procurement", href: "/admin/admin/procurement", icon: ShoppingCart },
  { label: "Logistics",   href: "/admin/admin/logistics",   icon: Truck      },
  { label: "Assets",      href: "/admin/admin/assets",      icon: Laptop     },
  { label: "Requests",    href: "/admin/admin/requests",    icon: Briefcase  },
  { label: "Vendors",     href: "/admin/admin/vendors",     icon: Building2  },
  { label: "Budget",      href: "/admin/admin/budget",      icon: DollarSign },
  { label: "Reports",     href: "/admin/admin/reports",     icon: BarChart3  },
];

export default function AdminDeptLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-2 pt-4 pb-2">
            <div className="h-7 w-7 rounded-lg bg-slate-700 flex items-center justify-center">
              <Briefcase className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-none">Office Admin</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Inventory, procurement, and office operations</p>
            </div>
          </div>

          <nav className="flex gap-0.5 overflow-x-auto pb-0 scrollbar-none" aria-label="Office Admin navigation">
            {TABS.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap
                    border-b-2 transition-all duration-150 shrink-0
                    ${active
                      ? "border-slate-700 text-slate-800 bg-slate-50/80"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }
                  `}
                >
                  <tab.icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-slate-700" : "text-slate-400"}`} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 bg-slate-50">{children}</div>
    </div>
  );
}
