import {
  Settings,
  FileText,
  Monitor,
  Users,
  Clock,
  GraduationCap,
  Landmark,
  DollarSign,
  BarChart3,
  TrendingUp,
  Briefcase,
  PieChart,
  Building2,
  Shield,
  Zap,
  Layers,
  CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Platform pillars                                                   */
/* ------------------------------------------------------------------ */

interface SubFeature {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ElementType;
}

interface Pillar {
  readonly emoji: string;
  readonly number: number;
  readonly title: string;
  readonly subtitle: string;
  readonly color: string;
  readonly iconColor: string;
  readonly borderColor: string;
  readonly badgeColor: string;
  readonly outcome: string;
  readonly features: readonly SubFeature[];
}

const pillars: readonly Pillar[] = [
  {
    emoji: "⚙️",
    number: 1,
    title: "Operations Management",
    subtitle: "Streamline your daily workflows and internal processes",
    color: "bg-indigo-600",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-100",
    badgeColor: "bg-indigo-50 text-indigo-700",
    outcome: "Organized operations with full visibility and control.",
    features: [
      {
        title: "Admin & Task Management",
        description: "Plan, assign, and track tasks with built-in workflows and approvals.",
        icon: Settings,
      },
      {
        title: "Document Management",
        description: "Securely store, organize, and control access to business-critical files with version tracking.",
        icon: FileText,
      },
      {
        title: "IT Asset Management",
        description: "Monitor and manage company assets, device assignments, and maintenance records.",
        icon: Monitor,
      },
    ],
  },
  {
    emoji: "👥",
    number: 2,
    title: "People Management",
    subtitle: "Empower your workforce and manage your team efficiently",
    color: "bg-violet-600",
    iconColor: "text-violet-600",
    borderColor: "border-violet-100",
    badgeColor: "bg-violet-50 text-violet-700",
    outcome: "A more productive, engaged, and well-managed workforce.",
    features: [
      {
        title: "HR & Payroll Management",
        description: "Handle employee records, payroll processing, and compliance in one place.",
        icon: Users,
      },
      {
        title: "Attendance & Time Tracking",
        description: "Monitor employee attendance, work hours, and productivity trends.",
        icon: Clock,
      },
      {
        title: "Training & Learning (LMS)",
        description: "Deliver training programs, track progress, and manage certifications.",
        icon: GraduationCap,
      },
    ],
  },
  {
    emoji: "💰",
    number: 3,
    title: "Financial Management",
    subtitle: "Gain full control over your business finances",
    color: "bg-emerald-600",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100",
    badgeColor: "bg-emerald-50 text-emerald-700",
    outcome: "Clear financial visibility and smarter decision-making.",
    features: [
      {
        title: "Accounting System",
        description: "Track income, expenses, and financial transactions with real-time accuracy.",
        icon: Landmark,
      },
      {
        title: "Expense Management",
        description: "Record, categorize, and monitor business spending efficiently.",
        icon: DollarSign,
      },
      {
        title: "Financial Reporting",
        description: "Generate insights with profit & loss, cash flow, and performance reports.",
        icon: BarChart3,
      },
    ],
  },
  {
    emoji: "📈",
    number: 4,
    title: "Growth & Revenue",
    subtitle: "Drive sales performance and business expansion",
    color: "bg-orange-600",
    iconColor: "text-orange-600",
    borderColor: "border-orange-100",
    badgeColor: "bg-orange-50 text-orange-700",
    outcome: "Stronger revenue growth and better strategic decisions.",
    features: [
      {
        title: "CRM (Customer Management)",
        description: "Manage leads, clients, and relationships in a centralized system.",
        icon: Briefcase,
      },
      {
        title: "Sales Pipeline Tracking",
        description: "Monitor deals, track progress, and improve conversion rates.",
        icon: TrendingUp,
      },
      {
        title: "Advanced Analytics",
        description: "Get actionable insights across sales, operations, and performance.",
        icon: PieChart,
      },
    ],
  },
  {
    emoji: "🏢",
    number: 5,
    title: "Platform & Infrastructure",
    subtitle: "Built for scalability, flexibility, and enterprise needs",
    color: "bg-blue-600",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
    badgeColor: "bg-blue-50 text-blue-700",
    outcome: "A scalable, customizable system that grows with your business.",
    features: [
      {
        title: "Multi-Tenant Architecture",
        description: "Manage multiple businesses or branches within one platform.",
        icon: Building2,
      },
      {
        title: "SSO / SAML Integration",
        description: "Enable secure and seamless enterprise authentication.",
        icon: Shield,
      },
      {
        title: "API & Integrations",
        description: "Connect with external systems and extend platform capabilities.",
        icon: Zap,
      },
      {
        title: "White-Label Branding",
        description: "Customize the platform with your brand, domain, and identity.",
        icon: Layers,
      },
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  FeatureBreakdownSection                                            */
/* ------------------------------------------------------------------ */

export function FeatureBreakdownSection() {
  return (
    <section id="features" className="py-20 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-blue-500 font-semibold text-sm uppercase tracking-widest mb-2">
            Platform Structure
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything Your Business Needs
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Manage operations, people, and performance from one intelligent platform.
            HUMI Hub unifies training, HR, administration, IT, sales, and finance
            into a single system designed to streamline workflows, improve visibility,
            and accelerate growth.
          </p>
        </div>

        {/* Pillars */}
        <div className="space-y-12">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className={`rounded-2xl border ${pillar.borderColor} bg-gray-50 p-8`}
            >
              {/* Pillar header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${pillar.color} flex items-center justify-center shrink-0 text-white font-bold text-sm`}>
                  {pillar.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{pillar.emoji}</span>
                    <h3 className="text-xl font-bold text-gray-900">{pillar.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{pillar.subtitle}</p>
                </div>
              </div>

              {/* Sub-features grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {pillar.features.map((feat) => (
                  <div
                    key={feat.title}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 hover:shadow-sm transition-shadow"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5`}>
                      <feat.icon className={`h-4 w-4 ${pillar.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{feat.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Outcome */}
              <div className={`mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${pillar.badgeColor}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Outcome: {pillar.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
