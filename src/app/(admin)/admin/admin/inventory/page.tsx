"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Package, Wrench, Pill, Archive, Fuel,
  AlertTriangle, ArrowRight, Loader2, TrendingDown,
} from "lucide-react";

interface SubcardStat {
  total: number;
  lowStock: number;
  outOfStock: number;
}

interface InventoryStats {
  officeSupplies: SubcardStat;
  maintenanceSupplies: SubcardStat;
  medicalSupplies: SubcardStat;
  stockroom: SubcardStat;
  fuelMaintenance: { totalVehicles: number; logsThisMonth: number };
}

const SUBCARDS = [
  {
    key: "officeSupplies" as const,
    label: "Office Supplies",
    desc: "Stationery, consumables, and department-issued items",
    icon: Package,
    accent: "bg-blue-600",
    border: "border-blue-100",
    href: "/admin/admin/inventory/office-supplies",
  },
  {
    key: "maintenanceSupplies" as const,
    label: "Maintenance Supplies",
    desc: "Tools, cleaning materials, and repair consumables",
    icon: Wrench,
    accent: "bg-amber-600",
    border: "border-amber-100",
    href: "/admin/admin/inventory/maintenance-supplies",
  },
  {
    key: "medicalSupplies" as const,
    label: "Medical Supplies",
    desc: "First aid items, medicines, and health essentials",
    icon: Pill,
    accent: "bg-rose-600",
    border: "border-rose-100",
    href: "/admin/admin/inventory/medical-supplies",
  },
  {
    key: "stockroom" as const,
    label: "Stockroom",
    desc: "Bulk storage, department transfers, and bin management",
    icon: Archive,
    accent: "bg-slate-600",
    border: "border-slate-200",
    href: "/admin/admin/inventory/stockroom",
  },
  {
    key: "fuelMaintenance" as const,
    label: "Fuel & Maintenance",
    desc: "Vehicle fuel logs, odometer tracking, and service records",
    icon: Fuel,
    accent: "bg-emerald-600",
    border: "border-emerald-100",
    href: "/admin/admin/inventory/fuel-maintenance",
  },
] as const;

export default function InventoryLandingPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/admin/office-admin/inventory-summary").then((r) => r.json()),
    ]).then(([res]) => {
      if (res.status === "fulfilled" && res.value.success) {
        setStats(res.value.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage all office inventory categories</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SUBCARDS.map((card) => {
          const isFuel = card.key === "fuelMaintenance";
          const stat = loading ? null : stats?.[card.key];

          return (
            <Link key={card.key} href={card.href}>
              <div className={`bg-white border ${card.border} rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group`}>
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl ${card.accent} flex items-center justify-center shrink-0`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{card.label}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
                </div>

                {/* Mini stats */}
                {loading ? (
                  <div className="flex items-center gap-1 text-xs text-slate-300">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                  </div>
                ) : isFuel && stat ? (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 font-medium">
                      {(stat as { totalVehicles: number }).totalVehicles} vehicles
                    </span>
                    <span className="text-slate-400">
                      {(stat as { logsThisMonth: number }).logsThisMonth} logs this month
                    </span>
                  </div>
                ) : stat ? (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 font-medium">
                      {(stat as SubcardStat).total} items
                    </span>
                    {(stat as SubcardStat).lowStock > 0 && (
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <TrendingDown className="h-3 w-3" />
                        {(stat as SubcardStat).lowStock} low
                      </span>
                    )}
                    {(stat as SubcardStat).outOfStock > 0 && (
                      <span className="flex items-center gap-0.5 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {(stat as SubcardStat).outOfStock} out
                      </span>
                    )}
                    {(stat as SubcardStat).lowStock === 0 && (stat as SubcardStat).outOfStock === 0 && (
                      <span className="text-emerald-600">All stocked</span>
                    )}
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
