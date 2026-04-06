import { Link2, BarChart3, Zap } from "lucide-react";
import Link from "next/link";

const points = [
  {
    icon: Link2,
    text: "Your employees, finances, operations, and sales are connected",
  },
  {
    icon: Zap,
    text: "Your data flows seamlessly across departments",
  },
  {
    icon: BarChart3,
    text: "Your decisions are backed by real-time insights",
  },
] as const;

export function PowerStatementSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Label */}
        <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4">
          🚀 Power Statement
        </p>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
          More than just software —{" "}
          <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            HUMI Hub is your business operating system.
          </span>
        </h2>

        {/* Sub-headline */}
        <p className="text-blue-200/80 text-lg mb-10 max-w-2xl mx-auto">
          Instead of juggling multiple tools, you get one unified platform where:
        </p>

        {/* Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {points.map((p) => (
            <div
              key={p.text}
              className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <p.icon className="h-5 w-5 text-blue-300" />
              </div>
              <p className="text-sm text-blue-100 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-950/40"
        >
          Get Started with HUMI Hub
        </Link>
      </div>
    </section>
  );
}
