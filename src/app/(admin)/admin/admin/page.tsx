import Link from "next/link";
import {
  Package, Truck, ShoppingCart, ArrowRight, Lock, Briefcase,
} from "lucide-react";

const MODULES = [
  {
    label: "Office Inventory",
    desc: "Stock levels, categories, and item tracking",
    icon: Package,
    accent: "bg-slate-600",
    href: "/admin/admin/inventory",
  },
  {
    label: "Logistics",
    desc: "Fleet, deliveries, and route management",
    icon: Truck,
    accent: "bg-amber-500",
    href: null,
  },
  {
    label: "Purchasing",
    desc: "Purchase orders and supplier management",
    icon: ShoppingCart,
    accent: "bg-emerald-600",
    href: null,
  },
] as const;

export default function OfficeAdminHub() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-600 flex items-center justify-center shrink-0">
          <Briefcase className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Office Admin</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Office resources, logistics, and procurement
          </p>
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod) => {
          const card = (
            <div
              className={`bg-white border rounded-2xl p-6 flex flex-col gap-4 transition-shadow ${
                mod.href ? "hover:shadow-md cursor-pointer" : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-11 w-11 rounded-xl ${mod.accent} flex items-center justify-center shrink-0`}>
                  <mod.icon className="h-5 w-5 text-white" />
                </div>
                {mod.href ? (
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Lock className="h-2.5 w-2.5" />
                    Coming soon
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{mod.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
              </div>
            </div>
          );

          return mod.href ? (
            <Link key={mod.label} href={mod.href}>
              {card}
            </Link>
          ) : (
            <div key={mod.label}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
