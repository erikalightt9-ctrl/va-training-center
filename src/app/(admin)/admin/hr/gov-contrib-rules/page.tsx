"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Settings } from "lucide-react";

interface Rule {
  id: string;
  contributionType: string;
  salaryFrom: number;
  salaryTo: number | null;
  employeeShare: number;
  employerShare: number;
  ruleKind: "FIXED" | "RATE";
  effectiveDate: string;
}

const fmt = (n: number) => n.toLocaleString("en-PH", { minimumFractionDigits: 2 });
const TYPES = ["SSS", "PHILHEALTH", "PAGIBIG", "INCOME_TAX"];
const TYPE_COLORS: Record<string, string> = {
  SSS: "bg-blue-50 border-blue-200", PHILHEALTH: "bg-green-50 border-green-200",
  PAGIBIG: "bg-orange-50 border-orange-200", INCOME_TAX: "bg-purple-50 border-purple-200",
};

export default function GovContribRulesPage() {
  const [rules, setRules]     = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/hr/gov-contrib-rules");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRules(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      const res  = await fetch("/api/admin/hr/gov-contrib-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_defaults" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRules(json.data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setSeeding(false);
    }
  };

  const grouped = TYPES.reduce<Record<string, Rule[]>>((acc, t) => {
    acc[t] = rules.filter((r) => r.contributionType === t);
    return acc;
  }, {});

  const TYPE_LABELS: Record<string, string> = {
    SSS: "SSS (Social Security System)",
    PHILHEALTH: "PhilHealth (Health Insurance)",
    PAGIBIG: "Pag-IBIG / HDMF (Housing Fund)",
    INCOME_TAX: "Withholding Tax on Compensation",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-600" />
            Government Contribution Rules
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            SSS, PhilHealth, Pag-IBIG, and Income Tax brackets used by the payroll engine
          </p>
        </div>
        {rules.length === 0 && (
          <button
            onClick={seedDefaults}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {seeding && <Loader2 className="h-4 w-4 animate-spin" />}
            Seed 2024 PH Defaults
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <Settings className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No contribution rules configured</p>
          <p className="text-sm text-slate-400 mt-1">
            Click <strong>Seed 2024 PH Defaults</strong> to load the official SSS, PhilHealth, and Pag-IBIG tables.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {TYPES.map((type) => {
            const typeRules = grouped[type];
            if (typeRules.length === 0) return null;
            return (
              <div key={type} className={`border rounded-xl overflow-hidden ${TYPE_COLORS[type] ?? "bg-white border-slate-200"}`}>
                <div className="px-5 py-3 border-b border-current border-opacity-20">
                  <h2 className="text-sm font-bold text-slate-700">{TYPE_LABELS[type] ?? type}</h2>
                  <p className="text-xs text-slate-500">{typeRules.length} brackets · Effective {new Date(typeRules[0].effectiveDate).toLocaleDateString("en-PH")}</p>
                </div>
                <div className="bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                        <th className="px-5 py-2 text-right">Salary From</th>
                        <th className="px-5 py-2 text-right">Salary To</th>
                        <th className="px-5 py-2 text-right">Employee Share</th>
                        <th className="px-5 py-2 text-right">Employer Share</th>
                        <th className="px-5 py-2 text-center">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {typeRules.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 text-xs">
                          <td className="px-5 py-2 text-right text-slate-600 font-mono">₱{fmt(Number(r.salaryFrom))}</td>
                          <td className="px-5 py-2 text-right text-slate-600 font-mono">
                            {r.salaryTo ? `₱${fmt(Number(r.salaryTo))}` : "No limit"}
                          </td>
                          <td className="px-5 py-2 text-right font-medium text-slate-800">
                            {r.ruleKind === "FIXED" ? `₱${fmt(Number(r.employeeShare))}` : `${Number(r.employeeShare)}%`}
                          </td>
                          <td className="px-5 py-2 text-right text-slate-600">
                            {r.ruleKind === "FIXED" ? `₱${fmt(Number(r.employerShare))}` : `${Number(r.employerShare)}%`}
                          </td>
                          <td className="px-5 py-2 text-center">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.ruleKind === "FIXED" ? "bg-slate-100 text-slate-600" : "bg-indigo-100 text-indigo-700"}`}>
                              {r.ruleKind}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
