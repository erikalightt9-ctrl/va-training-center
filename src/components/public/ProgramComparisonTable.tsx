/* ------------------------------------------------------------------ */
/*  Program comparison — table on desktop, stacked cards on mobile     */
/* ------------------------------------------------------------------ */

interface ProgramRow {
  readonly feature: string;
  readonly medicalVA: string;
  readonly realEstateVA: string;
  readonly bookkeepingVA: string;
}

const comparisonData: readonly ProgramRow[] = [
  {
    feature: "Duration",
    medicalVA: "8 weeks",
    realEstateVA: "8 weeks",
    bookkeepingVA: "8 weeks",
  },
  {
    feature: "Price",
    medicalVA: "\u20B115,000",
    realEstateVA: "\u20B112,000",
    bookkeepingVA: "\u20B112,000",
  },
  {
    feature: "Career Focus",
    medicalVA: "Healthcare Admin",
    realEstateVA: "Property Management",
    bookkeepingVA: "Financial Services",
  },
  {
    feature: "AI Tools",
    medicalVA: "Clinical docs, EHR",
    realEstateVA: "CRM, listings, marketing",
    bookkeepingVA: "QuickBooks, reconciliation",
  },
  {
    feature: "Best For",
    medicalVA: "Healthcare background",
    realEstateVA: "Sales/marketing interest",
    bookkeepingVA: "Detail-oriented, numbers",
  },
] as const;

const programs = [
  { key: "medicalVA" as const, label: "Medical VA", color: "bg-blue-600" },
  { key: "realEstateVA" as const, label: "Real Estate VA", color: "bg-emerald-600" },
  { key: "bookkeepingVA" as const, label: "US Bookkeeping VA", color: "bg-amber-600" },
] as const;

/* ------------------------------------------------------------------ */
/*  Desktop table                                                      */
/* ------------------------------------------------------------------ */

function DesktopTable() {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-500 w-1/4">
              Feature
            </th>
            {programs.map((prog) => (
              <th key={prog.key} className="text-left py-3 px-4 font-bold text-gray-900">
                <span className={`inline-block w-2 h-2 rounded-full ${prog.color} mr-2`} />
                {prog.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonData.map((row) => (
            <tr key={row.feature} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-700">{row.feature}</td>
              <td className="py-3 px-4 text-gray-600">{row.medicalVA}</td>
              <td className="py-3 px-4 text-gray-600">{row.realEstateVA}</td>
              <td className="py-3 px-4 text-gray-600">{row.bookkeepingVA}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile cards                                                       */
/* ------------------------------------------------------------------ */

function MobileCards() {
  return (
    <div className="md:hidden space-y-6">
      {programs.map((prog) => (
        <div
          key={prog.key}
          className="rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className={`${prog.color} text-white px-4 py-3 font-bold text-sm`}>
            {prog.label}
          </div>
          <div className="divide-y divide-gray-100">
            {comparisonData.map((row) => (
              <div key={row.feature} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="font-medium text-gray-500">{row.feature}</span>
                <span className="text-gray-900 text-right">
                  {row[prog.key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export function ProgramComparisonTable() {
  return (
    <div>
      <DesktopTable />
      <MobileCards />
    </div>
  );
}
