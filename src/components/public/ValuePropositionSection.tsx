import { LayoutDashboard, TrendingUp, BarChart3, Layers } from "lucide-react";

const values = [
  {
    icon: LayoutDashboard,
    title: "Centralized Operations",
    description: "Replace disconnected tools with one integrated system that manages HR, finance, IT, sales, admin, and training.",
    color: "bg-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Reduced Manual Work",
    description: "Automate payroll, workflows, and reporting so your team spends more time on what actually moves the business forward.",
    color: "bg-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Real-Time Insights",
    description: "Live dashboards across every department — revenue, headcount, sales performance, and training progress in one view.",
    color: "bg-purple-600",
  },
  {
    icon: Layers,
    title: "Scalable for Any Industry",
    description: "Enable only the modules you need today. Add HR, sales, or finance as your business grows — no migration required.",
    color: "bg-amber-600",
  },
] as const;

export function ValuePropositionSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wide mb-2">
            Why choose us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need. One Powerful Platform.
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Simplify your operations and focus on growth with a fully integrated
            system designed to handle your daily business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-4`}>
                <v.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>

        {/* Checkmark list */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-3">
          {[
            "Centralized business operations",
            "Reduced manual work and errors",
            "Real-time insights and reporting",
            "Scalable for any industry",
          ].map((point) => (
            <span key={point} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                ✓
              </span>
              {point}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
