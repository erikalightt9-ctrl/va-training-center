import {
  Bot,
  BarChart3,
  Bell,
  Zap,
  Mail,
  Trophy,
  FileSearch,
  Globe,
} from "lucide-react";

const advancedFeatures = [
  { icon: Bot,        title: "AI-Powered Automation",        description: "Automate ticket routing, replies, and categorization across HR, IT, and support." },
  { icon: BarChart3,  title: "Unified Analytics Dashboard",  description: "Revenue, headcount, sales performance, and training progress — all in one live view." },
  { icon: Bell,       title: "Real-Time Notifications",       description: "Instant alerts for payroll events, new leads, IT issues, and enrollments." },
  { icon: Zap,        title: "Workflow Automation",           description: "Onboarding, certificate issuance, payment verification — running on autopilot." },
  { icon: Mail,       title: "Email & SMS Alerts",            description: "Automated communications for every critical business event." },
  { icon: Trophy,     title: "Gamification & Engagement",    description: "Leaderboards, badges, and rankings to motivate students and staff alike." },
  { icon: FileSearch, title: "Report Exports",                description: "Download payroll, revenue, sales, attendance, and performance reports as CSV." },
  { icon: Globe,      title: "Multi-Branch Ready",            description: "Manage multiple locations or departments from one centralized control panel." },
] as const;

export function AdvancedFeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wide mb-2">
            Your Competitive Edge
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Advanced Features That Set You Apart
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Go beyond basic tools with AI automation, real-time analytics, and
            cross-department capabilities built for modern businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {advancedFeatures.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-900/40 transition-colors">
                <f.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
