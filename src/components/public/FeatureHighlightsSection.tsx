import {
  LayoutDashboard,
  Users,
  Landmark,
  TrendingUp,
  Monitor,
  GraduationCap,
  Check,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Executive Command Center",
    tagline: "Live company-wide visibility in one screen",
    color: "bg-blue-700",
    text: "text-blue-700",
    points: [
      "Sales, cash, workforce, and assets — one view",
      "All departments feed into a single dashboard",
      "Pending approvals and critical issues surfaced instantly",
      "Real-time decisions without waiting for reports",
    ],
  },
  {
    icon: Users,
    title: "HR & People",
    tagline: "Every people process, fully connected",
    color: "bg-emerald-600",
    text: "text-emerald-600",
    points: [
      "Leave, attendance, and payroll in one place",
      "Employee profiles, documents, and onboarding",
      "Approval workflows that route automatically",
      "Workforce analytics with live headcount data",
    ],
  },
  {
    icon: Landmark,
    title: "Finance & Accounting",
    tagline: "Full financial visibility for leadership",
    color: "bg-violet-600",
    text: "text-violet-600",
    points: [
      "Bank balances, assets, and liabilities in real time",
      "Invoices, expenses, and transactions tracked",
      "Payroll integrated with financial reporting",
      "P&L and cash flow accessible to executives",
    ],
  },
  {
    icon: TrendingUp,
    title: "Sales & Revenue",
    tagline: "Pipeline and performance, always visible",
    color: "bg-amber-500",
    text: "text-amber-600",
    points: [
      "Sales pipeline tracked by team and rep",
      "Revenue vs. targets visible to leadership",
      "Deal history, contacts, and activity logs",
      "Performance feeds directly into the Command Center",
    ],
    badge: "Coming soon",
  },
  {
    icon: Monitor,
    title: "IT & Systems",
    tagline: "Infrastructure and access, under control",
    color: "bg-rose-600",
    text: "text-rose-600",
    points: [
      "IT asset inventory and assignment",
      "Maintenance and repair request tracking",
      "System access control and user management",
      "Infrastructure status visible to executives",
    ],
    badge: "Coming soon",
  },
  {
    icon: GraduationCap,
    title: "Training & Learning",
    tagline: "Structured development for every role",
    color: "bg-cyan-600",
    text: "text-cyan-700",
    points: [
      "Build and assign courses by department or role",
      "Quizzes, certificates, and completion tracking",
      "Learner progress feeds the executive dashboard",
      "White-label portals for clients and partners",
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  FeatureHighlightsSection                                           */
/* ------------------------------------------------------------------ */

export function FeatureHighlightsSection() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">
            All departments. One system.
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Every department operates here — and leadership sees everything.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Each department has its own structured workspace. Every action feeds
            into a single, real-time view for executives.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative border rounded-2xl p-6 bg-white hover:shadow-md transition-shadow"
            >
              {"badge" in f && f.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                  {f.badge}
                </span>
              )}

              <div className={`h-11 w-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className={`text-sm font-medium ${f.text} mb-4`}>{f.tagline}</p>

              <ul className="space-y-2">
                {f.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className={`h-4 w-4 ${f.text} shrink-0 mt-0.5`} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
