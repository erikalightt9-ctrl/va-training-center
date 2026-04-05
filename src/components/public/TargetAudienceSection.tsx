import {
  Building2,
  GraduationCap,
  Megaphone,
  Briefcase,
  ShoppingBag,
  Rocket,
} from "lucide-react";

const audiences = [
  {
    icon: Building2,
    title: "Small & Medium Enterprises",
    description: "Centralize HR, finance, and operations across your entire business in one connected platform.",
    color: "bg-blue-900/40 text-blue-400",
  },
  {
    icon: GraduationCap,
    title: "Training Centers",
    description: "Manage students, courses, trainers, schedules, and certifications with built-in LMS tools.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: Megaphone,
    title: "Agencies & Consultancies",
    description: "Track leads, manage client projects, and run your team operations from a single dashboard.",
    color: "bg-pink-900/40 text-pink-400",
  },
  {
    icon: Briefcase,
    title: "Service-Based Companies",
    description: "Streamline admin, automate workflows, and monitor performance across all departments.",
    color: "bg-emerald-900/40 text-emerald-400",
  },
  {
    icon: ShoppingBag,
    title: "Retail & Sales Businesses",
    description: "Track sales pipelines, manage inventory, and keep your finance reporting accurate and up to date.",
    color: "bg-amber-900/40 text-amber-400",
  },
  {
    icon: Rocket,
    title: "Startups & Growing Teams",
    description: "Start lean with the modules you need and scale up as your business grows — no switching tools.",
    color: "bg-indigo-100 text-indigo-700",
  },
] as const;

export function TargetAudienceSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-wide mb-2">
            Who it&apos;s for
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for Growing Businesses Across Industries
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Whether you&apos;re managing a training center, a growing agency, or a
            full-scale SME — HUMI Hub adapts to your industry and scales with
            your team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((a) => (
            <div
              key={a.title}
              className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center mb-4`}>
                <a.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
