import {
  GraduationCap,
  Users,
  Settings,
  Monitor,
  TrendingUp,
  Landmark,
  BookOpen,
  Clock,
  BarChart3,
  FileText,
  DollarSign,
  Shield,
  Zap,
  UserCheck,
  PieChart,
  Briefcase,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Feature data                                                       */
/* ------------------------------------------------------------------ */

interface Feature {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly icon: React.ElementType;
  readonly color: string;
  readonly highlights: readonly string[];
}

const features: readonly Feature[] = [
  {
    title: "Training Management",
    subtitle: "Full LMS built for results",
    description:
      "Manage courses, schedules, trainers, and participants with ease. From enrollment to certification, every step is tracked and automated.",
    icon: GraduationCap,
    color: "bg-blue-600",
    highlights: [
      "Course & curriculum builder",
      "Trainer schedule management",
      "Attendance & progress tracking",
      "Certificate auto-generation",
    ],
  },
  {
    title: "Human Resources",
    subtitle: "People management made simple",
    description:
      "Handle employee records, payroll processing, attendance, and performance tracking in one centralized HR system.",
    icon: Users,
    color: "bg-violet-600",
    highlights: [
      "Employee records & onboarding",
      "Payroll & leave management",
      "Attendance & timekeeping",
      "Performance reviews",
    ],
  },
  {
    title: "Administration",
    subtitle: "Keep operations running smoothly",
    description:
      "Streamline internal processes, documentation, and daily operations so your admin team can work faster with fewer errors.",
    icon: Settings,
    color: "bg-indigo-600",
    highlights: [
      "Document management",
      "Internal workflow automation",
      "Task assignment & tracking",
      "Company-wide announcements",
    ],
  },
  {
    title: "IT Systems & Automation",
    subtitle: "Digitize your entire workflow",
    description:
      "Manage IT assets, automate repetitive processes, and keep your systems running efficiently without heavy technical overhead.",
    icon: Monitor,
    color: "bg-cyan-600",
    highlights: [
      "IT asset & license tracking",
      "Helpdesk & ticket management",
      "Workflow digitization",
      "System health monitoring",
    ],
  },
  {
    title: "Sales Management",
    subtitle: "Track and close more deals",
    description:
      "Monitor your full sales pipeline, manage leads, and generate performance reports so your team always knows where to focus.",
    icon: TrendingUp,
    color: "bg-orange-600",
    highlights: [
      "Lead & pipeline tracking",
      "Sales performance reports",
      "Deal stage management",
      "Client history & notes",
    ],
  },
  {
    title: "Finance & Accounting",
    subtitle: "Stay on top of your numbers",
    description:
      "Organized and accurate financial reporting tools to manage invoices, expenses, and revenue — all in one place.",
    icon: Landmark,
    color: "bg-emerald-600",
    highlights: [
      "Invoice & billing management",
      "Expense tracking",
      "Revenue reporting",
      "Financial dashboards",
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Detail icon map                                                    */
/* ------------------------------------------------------------------ */

const DETAIL_ICONS: Record<string, React.ElementType> = {
  "Course & curriculum builder":        BookOpen,
  "Trainer schedule management":        Clock,
  "Attendance & progress tracking":     BarChart3,
  "Certificate auto-generation":        FileText,
  "Employee records & onboarding":      UserCheck,
  "Payroll & leave management":         DollarSign,
  "Attendance & timekeeping":           Clock,
  "Performance reviews":                BarChart3,
  "Document management":                FileText,
  "Internal workflow automation":       Zap,
  "Task assignment & tracking":         Settings,
  "Company-wide announcements":         Users,
  "IT asset & license tracking":        Shield,
  "Helpdesk & ticket management":       Briefcase,
  "Workflow digitization":              Zap,
  "System health monitoring":           Monitor,
  "Lead & pipeline tracking":           TrendingUp,
  "Sales performance reports":          PieChart,
  "Deal stage management":              BarChart3,
  "Client history & notes":             FileText,
  "Invoice & billing management":       FileText,
  "Expense tracking":                   DollarSign,
  "Revenue reporting":                  PieChart,
  "Financial dashboards":               BarChart3,
};

/* ------------------------------------------------------------------ */
/*  FeatureBreakdownSection                                            */
/* ------------------------------------------------------------------ */

export function FeatureBreakdownSection() {
  return (
    <section id="features" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wide mb-2">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Business Solutions
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Six powerful modules that cover every department of your business —
            from training and HR to sales, finance, and IT.
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div
                key={feature.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}
              >
                {/* Text side */}
                <div className={isReversed ? "lg:order-2" : ""}>
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-400 mb-1">{feature.subtitle}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">{feature.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feature.highlights.map((h) => {
                      const Icon = DETAIL_ICONS[h] ?? BookOpen;
                      return (
                        <div key={h} className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="h-3.5 w-3.5 text-gray-600" />
                          </div>
                          <span className="text-sm text-gray-700">{h}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visual side */}
                <div className={isReversed ? "lg:order-1" : ""}>
                  <FeatureMockup feature={feature} index={index} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Mockup Cards                                               */
/* ------------------------------------------------------------------ */

function FeatureMockup({
  feature,
  index,
}: {
  readonly feature: Feature;
  readonly index: number;
}) {
  const mockups = [
    /* 0 — Training Management */
    <div key="training" className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-sm">Active Courses</h4>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">12 courses</span>
      </div>
      <div className="space-y-3">
        {["Healthcare VA Training", "Real Estate Program", "Digital Marketing"].map((name, i) => (
          <div key={name} className="bg-white rounded-xl p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">3 tiers · {20 + i * 4} lessons</p>
              </div>
              <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</div>
            </div>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${55 + i * 15}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>,

    /* 1 — Human Resources */
    <div key="hr" className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-sm">HR Overview</h4>
        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">48 employees</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "On Leave",    value: "3",    color: "text-amber-600"  },
          { label: "Payroll Due", value: "₱240K", color: "text-blue-600"  },
          { label: "New Hires",   value: "2",    color: "text-emerald-600" },
          { label: "Open Roles",  value: "5",    color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {["Maria Santos — On leave until Apr 10", "John Cruz — Payroll processed", "Ana Reyes — New hire onboarding"].map((t) => (
          <div key={t} className="flex items-center gap-2 p-1.5 bg-white rounded-md border border-gray-100">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <p className="text-[10px] text-gray-600 truncate">{t}</p>
          </div>
        ))}
      </div>
    </div>,

    /* 2 — Administration */
    <div key="admin" className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-sm">Admin Tasks</h4>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">7 pending</span>
      </div>
      <div className="space-y-2">
        {[
          { task: "Update company policy document",   due: "Today",    priority: "High",   dot: "bg-red-400" },
          { task: "Schedule Q2 department meetings",  due: "Apr 12",   priority: "Medium", dot: "bg-amber-400" },
          { task: "File monthly compliance report",   due: "Apr 15",   priority: "High",   dot: "bg-red-400" },
          { task: "Onboard 2 new team members",       due: "Apr 20",   priority: "Normal", dot: "bg-blue-400" },
        ].map((t) => (
          <div key={t.task} className="bg-white rounded-xl p-3 border border-gray-100">
            <div className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${t.dot} mt-1.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{t.task}</p>
                <p className="text-[10px] text-gray-500">Due {t.due} · {t.priority}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    /* 3 — IT Systems */
    <div key="it" className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-sm">IT Dashboard</h4>
        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">All systems</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Assets",       value: "142",  color: "text-cyan-600"  },
          { label: "Open Tickets", value: "4",    color: "text-amber-600" },
          { label: "Licenses",     value: "28",   color: "text-blue-600"  },
          { label: "Uptime",       value: "99.9%", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {["Server upgrade — Completed", "VPN access: 3 new users", "Software license expiry: Apr 30"].map((t) => (
          <div key={t} className="flex items-center gap-2 p-1.5 bg-white rounded-md border border-gray-100">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <p className="text-[10px] text-gray-600 truncate">{t}</p>
          </div>
        ))}
      </div>
    </div>,

    /* 4 — Sales Management */
    <div key="sales" className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-sm">Sales Pipeline</h4>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">12 active leads</span>
      </div>
      <div className="space-y-2">
        {[
          { name: "Acme Corp",       stage: "Proposal",    value: "₱85K",  dot: "bg-blue-400"   },
          { name: "Global Retail",   stage: "Negotiation", value: "₱120K", dot: "bg-amber-400"  },
          { name: "TechPro Inc.",    stage: "Closed Won",  value: "₱65K",  dot: "bg-emerald-400"},
          { name: "Swift Agency",    stage: "Prospecting", value: "₱40K",  dot: "bg-gray-400"   },
        ].map((lead) => (
          <div key={lead.name} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${lead.dot}`} />
              <div>
                <p className="text-xs font-medium text-gray-900">{lead.name}</p>
                <p className="text-[10px] text-gray-500">{lead.stage}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-700">{lead.value}</span>
          </div>
        ))}
      </div>
    </div>,

    /* 5 — Finance & Accounting */
    <div key="finance" className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 text-sm">Finance Overview</h4>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">April 2025</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Total Revenue",  value: "₱4.8M", change: "+14%", up: true  },
          { label: "Total Expenses", value: "₱1.2M", change: "-5%",  up: false },
          { label: "Net Profit",     value: "₱3.6M", change: "+21%", up: true  },
          { label: "Pending Inv.",   value: "8",      change: "",     up: true  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-2.5 border border-gray-100">
            <p className="text-[10px] text-gray-500">{s.label}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              {s.change && (
                <span className={`text-[9px] font-medium ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                  {s.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-3 border border-gray-100">
        <p className="text-[10px] text-gray-500 mb-2">Monthly Revenue Trend</p>
        <div className="flex items-end gap-1 h-10">
          {[50, 60, 45, 70, 65, 80, 75, 85, 90, 88, 95, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-emerald-400 rounded-sm opacity-80" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>,
  ];

  return mockups[index] ?? mockups[0];
}
