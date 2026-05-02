"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Package, ShoppingCart, Truck, Laptop, Briefcase, Building2,
  DollarSign, BarChart3, Plus, ArrowRight, AlertTriangle,
  Clock, CheckCircle, TrendingUp,
} from "lucide-react";

interface Stats {
  inventory: { lowStock: number; outOfStock: number };
  procurement: { pending: number; ordered: number };
  logistics: { scheduled: number; inTransit: number };
  requests: { pending: number; approved: number };
}

const MODULES = [
  { label: "Inventory",   href: "/admin/admin/inventory",   icon: Package,      accent: "bg-blue-600",   desc: "Office supplies, medical, stockroom" },
  { label: "Procurement", href: "/admin/admin/procurement", icon: ShoppingCart, accent: "bg-emerald-600",desc: "Purchase orders & supplier sourcing" },
  { label: "Logistics",   href: "/admin/admin/logistics",   icon: Truck,        accent: "bg-amber-500",  desc: "Fleet management & deliveries" },
  { label: "Assets",      href: "/admin/admin/assets",      icon: Laptop,       accent: "bg-teal-600",   desc: "Office assets & equipment" },
  { label: "Requests",    href: "/admin/admin/requests",    icon: Briefcase,    accent: "bg-indigo-600", desc: "Internal requests & approvals" },
  { label: "Vendors",     href: "/admin/admin/vendors",     icon: Building2,    accent: "bg-slate-600",  desc: "Vendor directory & contacts" },
  { label: "Budget",      href: "/admin/admin/budget",      icon: DollarSign,   accent: "bg-violet-600", desc: "Category budgets & spend tracking" },
  { label: "Reports",     href: "/admin/admin/reports",     icon: BarChart3,    accent: "bg-rose-600",   desc: "Usage reports & cost analysis" },
] as const;

const QUICK_ACTIONS = [
  { label: "Add Inventory Item",  href: "/admin/admin/inventory",   icon: Plus,         color: "bg-blue-50 text-blue-700 border-blue-200"    },
  { label: "New Purchase Order",  href: "/admin/admin/procurement", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Log Delivery",        href: "/admin/admin/logistics",   icon: Truck,        color: "bg-amber-50 text-amber-700 border-amber-200"  },
  { label: "New Request",         href: "/admin/admin/requests",    icon: Briefcase,    color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { label: "Add Asset",           href: "/admin/admin/assets",      icon: Laptop,       color: "bg-teal-50 text-teal-700 border-teal-200"    },
  { label: "Add Vendor",          href: "/admin/admin/vendors",     icon: Building2,    color: "bg-slate-50 text-slate-700 border-slate-200"  },
];

export default function OfficeAdminHub() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/office-admin/inventory-summary").then((r) => r.json()),
      fetch("/api/admin/office-admin/procurement?stats=1").then((r) => r.json()),
      fetch("/api/admin/office-admin/logistics?stats=1").then((r) => r.json()),
      fetch("/api/admin/office-admin/requests?stats=1").then((r) => r.json()),
    ]).then(([inv, proc, log, req]) => {
      setStats({
        inventory:   { lowStock: inv.data?.lowStock ?? 0,   outOfStock: inv.data?.outOfStock ?? 0 },
        procurement: { pending:  proc.data?.pending  ?? 0,  ordered:    proc.data?.ordered    ?? 0 },
        logistics:   { scheduled: log.data?.scheduled ?? 0, inTransit:  log.data?.inTransit   ?? 0 },
        requests:    { pending:  req.data?.pending   ?? 0,  approved:   req.data?.approved    ?? 0 },
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Office Admin</h1>
        <p className="text-sm text-slate-500 mt-0.5">Inventory, procurement, logistics, assets, and office operations</p>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} href={a.href} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all hover:shadow-sm ${a.color}`}>
              <a.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Live KPI Strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.inventory.lowStock + stats.inventory.outOfStock > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800">{stats.inventory.lowStock + stats.inventory.outOfStock} Stock Alerts</p>
                <p className="text-[10px] text-amber-600">{stats.inventory.outOfStock} out of stock</p>
              </div>
            </div>
          )}
          {stats.procurement.pending > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-800">{stats.procurement.pending} Pending POs</p>
                <p className="text-[10px] text-blue-600">{stats.procurement.ordered} ordered</p>
              </div>
            </div>
          )}
          {stats.logistics.inTransit > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-800">{stats.logistics.inTransit} In Transit</p>
                <p className="text-[10px] text-emerald-600">{stats.logistics.scheduled} scheduled</p>
              </div>
            </div>
          )}
          {stats.requests.pending > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-800">{stats.requests.pending} Pending Requests</p>
                <p className="text-[10px] text-indigo-600">{stats.requests.approved} approved</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Module Grid */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Modules</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODULES.map((mod) => (
            <Link key={mod.label} href={mod.href} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-lg ${mod.accent} flex items-center justify-center shrink-0`}>
                  <mod.icon className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{mod.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
