import Link from "next/link";
import {
  Package, Truck, ShoppingCart, ArrowRight, Lock, Briefcase,
  Laptop, Users, BarChart3, DollarSign, Building2,
} from "lucide-react";

const MODULES = [
  {
    label: "Inventory",
    desc: "Office supplies, maintenance materials, medical, stockroom & fuel",
    icon: Package,
    accent: "bg-slate-600",
    href: "/admin/admin/inventory",
  },
  {
    label: "Procurement",
    desc: "Purchase orders, requisitions, and supplier sourcing",
    icon: ShoppingCart,
    accent: "bg-emerald-600",
    href: "/admin/admin/procurement",
  },
  {
    label: "Logistics",
    desc: "Fleet management, deliveries, and route planning",
    icon: Truck,
    accent: "bg-amber-500",
    href: "/admin/admin/logistics",
  },
  {
    label: "Assets",
    desc: "Company assets, equipment tracking, and depreciation",
    icon: Laptop,
    accent: "bg-blue-600",
    href: "/admin/admin/assets",
  },
  {
    label: "Requests",
    desc: "Internal office requests and approvals workflow",
    icon: Briefcase,
    accent: "bg-indigo-600",
    href: "/admin/admin/requests",
  },
  {
    label: "Vendors",
    desc: "Vendor directory, contracts, and performance tracking",
    icon: Building2,
    accent: "bg-teal-600",
    href: "/admin/admin/vendors",
  },
  {
    label: "Budget",
    desc: "Department budgets, allocations, and spend tracking",
    icon: DollarSign,
    accent: "bg-violet-600",
    href: "/admin/admin/budget",
  },
  {
    label: "Reports",
    desc: "Usage reports, cost analysis, and audit summaries",
    icon: BarChart3,
    accent: "bg-rose-600",
    href: "/admin/admin/reports",
  },
] as const;

export default function OfficeAdminHub() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-700 flex items-center justify-center shrink-0">
          <Briefcase className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Office Admin</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Inventory, procurement, logistics, assets, and office operations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MODULES.map((mod) => (
          <Link key={mod.label} href={mod.href}>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl ${mod.accent} flex items-center justify-center shrink-0`}>
                  <mod.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{mod.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
