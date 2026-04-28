import { BarChart3, Clock } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-rose-600 flex items-center justify-center mb-4 opacity-80">
        <BarChart3 className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Reports</h2>
      <p className="text-sm text-slate-500 max-w-xs mb-4">Usage reports, cost analysis, and audit summaries</p>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-500">
        <Clock className="h-3 w-3" /> Coming Soon
      </div>
    </div>
  );
}
