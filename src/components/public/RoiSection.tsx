import { TrendingDown, TrendingUp, Clock, Zap } from "lucide-react";

const stats = [
  {
    icon: TrendingDown,
    value: "70%",
    label: "Less Admin Work",
    description: "Automate HR, payroll, enrollment, and reporting across departments",
    color: "text-blue-500 bg-blue-50",
  },
  {
    icon: TrendingUp,
    value: "3x",
    label: "Faster Operations",
    description: "From staff onboarding and training to finance and deployment",
    color: "text-emerald-500 bg-emerald-50",
  },
  {
    icon: Clock,
    value: "90%",
    label: "Faster Support Response",
    description: "AI-powered ticketing handles common queries instantly",
    color: "text-purple-500 bg-purple-50",
  },
  {
    icon: Zap,
    value: "2x",
    label: "Higher Team Performance",
    description: "Structured workflows and analytics drive measurable business results",
    color: "text-amber-500 bg-amber-50",
  },
] as const;

export function RoiSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-500 font-semibold text-sm uppercase tracking-widest mb-2">
            Business Impact
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Growing Businesses Choose HUMI Hub
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Real results from organizations across industries — training centers, corporates, HR teams, and operations managers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-4`}>
                <s.icon className="h-7 w-7" />
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">{s.value}</p>
              <p className="font-semibold text-gray-700 text-sm mb-1">{s.label}</p>
              <p className="text-xs text-gray-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
