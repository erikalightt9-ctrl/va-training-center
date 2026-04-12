"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car, ShoppingBasket, Wrench, ClipboardList, Truck, PackageOpen, Archive, AlertTriangle, Loader2,
} from "lucide-react";

type Stats = {
  totalAssets: number;
  assetsForRepair: number;
  assetsForDispose: number;
  assetsUnderWarranty: number;
  totalEquipment: number;
  pendingRepairs: number;
  lowStockPantry: number;
  lowStockMaintenance: number;
  activeSuppliers: number;
};

const QUICK_LINKS = [
  { label: "Car Maintenance & Fuel", href: "/admin/admin/car-maintenance", icon: Car,          color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Pantry Inventory",       href: "/admin/admin/pantry",          icon: ShoppingBasket, color: "bg-green-50 text-green-700 border-green-200" },
  { label: "Maintenance Inventory",  href: "/admin/admin/maintenance",     icon: Wrench,         color: "bg-orange-50 text-orange-700 border-orange-200" },
  { label: "Repair Logs",            href: "/admin/admin/repair-logs",     icon: ClipboardList,  color: "bg-red-50 text-red-700 border-red-200" },
  { label: "Suppliers",              href: "/admin/admin/suppliers",       icon: Truck,          color: "bg-purple-50 text-purple-700 border-purple-200" },
  { label: "Equipment Inventory",    href: "/admin/admin/equipment",       icon: PackageOpen,    color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { label: "Assets",                 href: "/admin/admin/assets",          icon: Archive,        color: "bg-teal-50 text-teal-700 border-teal-200" },
];

export default function AdminDeptDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dept/assets?stats=1").then((r) => r.json()),
      fetch("/api/admin/dept/repair-logs?stats=1").then((r) => r.json()),
      fetch("/api/admin/dept/pantry?stats=1").then((r) => r.json()),
      fetch("/api/admin/dept/maintenance-items?stats=1").then((r) => r.json()),
      fetch("/api/admin/dept/suppliers?stats=1").then((r) => r.json()),
      fetch("/api/admin/dept/equipment?stats=1").then((r) => r.json()),
    ]).then(([assets, repairs, pantry, maint, suppliers, equip]) => {
      setStats({
        totalAssets:         assets.data?.total          ?? 0,
        assetsForRepair:     assets.data?.forRepair      ?? 0,
        assetsForDispose:    assets.data?.forDispose     ?? 0,
        assetsUnderWarranty: assets.data?.underWarranty  ?? 0,
        totalEquipment:      equip.data?.total           ?? 0,
        pendingRepairs:      repairs.data?.pending       ?? 0,
        lowStockPantry:      pantry.data?.lowStock       ?? 0,
        lowStockMaintenance: maint.data?.lowStock        ?? 0,
        activeSuppliers:     suppliers.data?.active      ?? 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Department</h1>
        <p className="text-sm text-slate-500">Manage assets, vehicles, inventory, repairs, and suppliers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Assets",       value: stats?.totalAssets,         sub: "Furniture, appliances, machines" },
              { label: "Pending Repairs",    value: stats?.pendingRepairs,       sub: "Open repair logs",       warn: (stats?.pendingRepairs ?? 0) > 0 },
              { label: "Low Stock Alerts",   value: (stats?.lowStockPantry ?? 0) + (stats?.lowStockMaintenance ?? 0), sub: "Pantry + maintenance", warn: ((stats?.lowStockPantry ?? 0) + (stats?.lowStockMaintenance ?? 0)) > 0 },
              { label: "Active Suppliers",   value: stats?.activeSuppliers,      sub: "Registered suppliers" },
            ].map((card) => (
              <div key={card.label} className={`bg-white border rounded-xl p-4 ${card.warn ? "border-amber-300" : "border-slate-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-500">{card.label}</p>
                  {card.warn && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </div>
                <p className={`text-2xl font-bold ${card.warn ? "text-amber-600" : "text-slate-900"}`}>{card.value ?? 0}</p>
                <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Asset Status Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Asset Status Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "For Repair",       value: stats?.assetsForRepair,    color: "bg-red-100 text-red-700" },
                { label: "For Dispose",      value: stats?.assetsForDispose,   color: "bg-slate-100 text-slate-700" },
                { label: "Under Warranty",   value: stats?.assetsUnderWarranty, color: "bg-blue-100 text-blue-700" },
                { label: "Equipment Total",  value: stats?.totalEquipment,     color: "bg-teal-100 text-teal-700" },
              ].map((item) => (
                <div key={item.label} className={`rounded-lg px-3 py-2 ${item.color}`}>
                  <p className="text-lg font-bold">{item.value ?? 0}</p>
                  <p className="text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 border rounded-xl p-4 hover:opacity-80 transition-opacity ${link.color}`}
              >
                <link.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
