"use client";

import Link from "next/link";
import {
  TrendingUp,
  BarChart2,
  Droplets,
  Scale,
  BookOpen,
  Users,
  FileText,
  Percent,
} from "lucide-react";

const STANDARD_REPORTS = [
  {
    title: "Profit & Loss",
    description: "View revenue, expenses, and net income for any date range.",
    icon: TrendingUp,
    href: "/admin/accounting/reports/profit-loss",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Balance Sheet",
    description: "Snapshot of assets, liabilities, and equity as of any date.",
    icon: Scale,
    href: "/admin/accounting/reports/balance-sheet",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Cash Flow",
    description: "Track cash inflows and outflows over a period.",
    icon: Droplets,
    href: "/admin/accounting/reports/cash-flow",
    color: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Trial Balance",
    description: "Verify that total debits equal total credits across all accounts.",
    icon: BarChart2,
    href: "/admin/accounting/reports/trial-balance",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    title: "General Ledger",
    description: "Detailed transaction history for any account and date range.",
    icon: BookOpen,
    href: "/admin/accounting/reports/general-ledger",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Receivables & Payables",
    description: "Overview of outstanding customer balances and vendor payables.",
    icon: Users,
    href: "/admin/accounting/reports/receivables",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

const BIR_REPORTS = [
  {
    title: "VAT Summary (2550M / 2550Q)",
    description: "Output VAT vs. Input VAT breakdown. Ready for BIR Monthly/Quarterly VAT Declaration.",
    icon: Percent,
    href: "/admin/accounting/reports/bir-vat-summary",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
    badge: "BIR Form 2550M",
  },
  {
    title: "Withholding Tax (EWT)",
    description: "Expanded withholding tax summary by supplier with BIR ATC codes. For Form 1601-EQ.",
    icon: FileText,
    href: "/admin/accounting/reports/bir-withholding",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
    badge: "BIR Form 1601-EQ",
  },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Financial Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and view financial statements</p>
      </div>

      {/* Standard Reports */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Standard Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {STANDARD_REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.href} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
                <div className={`inline-flex p-3 rounded-xl ${report.color} mb-4 self-start`}>
                  <Icon className={`h-6 w-6 ${report.iconColor}`} />
                </div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">{report.title}</h2>
                <p className="text-sm text-slate-500 flex-1 mb-4">{report.description}</p>
                <Link
                  href={report.href}
                  className="block text-center text-sm text-emerald-600 border border-emerald-200 rounded-lg py-2 hover:bg-emerald-50 transition-colors font-medium"
                >
                  View Report
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* BIR Compliance Reports */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            BIR Compliance Reports
          </h2>
          <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">
            Philippines
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BIR_REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.href}
                className="bg-white border border-orange-200 rounded-xl p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex p-3 rounded-xl ${report.color}`}>
                    <Icon className={`h-6 w-6 ${report.iconColor}`} />
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">
                    {report.badge}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-slate-800 mb-2">{report.title}</h2>
                <p className="text-sm text-slate-500 flex-1 mb-4">{report.description}</p>
                <Link
                  href={report.href}
                  className="block text-center text-sm text-orange-600 border border-orange-200 rounded-lg py-2 hover:bg-orange-50 transition-colors font-medium"
                >
                  View Report
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
