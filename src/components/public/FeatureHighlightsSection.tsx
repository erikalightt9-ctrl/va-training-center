import {
  GraduationCap,
  Users,
  BarChart3,
  ClipboardList,
  Wallet,
  Building2,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: GraduationCap,
    title: "Learning Management",
    tagline: "Build, assign, and track every course",
    color: "bg-blue-600",
    light: "bg-blue-50 border-blue-100",
    text: "text-blue-600",
    points: [
      "Create modules with quizzes and certificates",
      "Auto-enroll employees by role or department",
      "Track completion rates in real time",
      "Multi-tenant white-label course portals",
    ],
  },
  {
    icon: Users,
    title: "HR Operations",
    tagline: "Leave, attendance, and employee records",
    color: "bg-emerald-600",
    light: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-600",
    points: [
      "Leave requests with approval workflows",
      "Attendance tracking with status reports",
      "Employee profiles and document storage",
      "Onboarding checklists for new hires",
    ],
  },
  {
    icon: Wallet,
    title: "Payroll",
    tagline: "Accurate runs, every pay period",
    color: "bg-violet-600",
    light: "bg-violet-50 border-violet-100",
    text: "text-violet-600",
    points: [
      "Automated gross-to-net calculations",
      "Configurable allowances and deductions",
      "Printable payslips for every employee",
      "Payroll run history and audit trail",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    tagline: "Data your whole team can act on",
    color: "bg-amber-500",
    light: "bg-amber-50 border-amber-100",
    text: "text-amber-600",
    points: [
      "HR, payroll, and training in one view",
      "AI-generated workforce narratives",
      "Headcount, leave, and attendance trends",
      "Export-ready reports for stakeholders",
    ],
  },
  {
    icon: ClipboardList,
    title: "Action Center",
    tagline: "Nothing slips through the cracks",
    color: "bg-rose-600",
    light: "bg-rose-50 border-rose-100",
    text: "text-rose-600",
    points: [
      "Pending approvals surfaced instantly",
      "AI summary of what needs attention",
      "Repair and maintenance request tracking",
      "Cross-module task visibility",
    ],
  },
  {
    icon: Building2,
    title: "Multi-Tenant Platform",
    tagline: "One hub, unlimited organisations",
    color: "bg-slate-700",
    light: "bg-slate-50 border-slate-200",
    text: "text-slate-700",
    points: [
      "Separate portals per client or division",
      "Custom branding, logo, and domain",
      "Role-based access across all tenants",
      "Instant subdomain provisioning",
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
            Everything in one place
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Six modules. Zero switching.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Every tool your team needs to hire, train, pay, and grow — built
            to work together from day one.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`border rounded-2xl p-6 bg-white hover:shadow-md transition-shadow`}
            >
              {/* Icon */}
              <div className={`h-11 w-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className={`text-sm font-medium ${f.text} mb-4`}>{f.tagline}</p>

              {/* Feature points */}
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
