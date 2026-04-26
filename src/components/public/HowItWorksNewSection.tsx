import Link from "next/link";
import { DatabaseZap, Play, Activity, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: DatabaseZap,
    title: "Input Data",
    description:
      "Every department records what's happening — invoices issued, attendance logged, deals closed, tasks assigned. All data flows into one connected system.",
  },
  {
    number: "02",
    icon: Play,
    title: "Execute Work",
    description:
      "Teams act through structured workspaces — approvals routed automatically, tasks assigned to the right person, workflows that keep operations moving.",
  },
  {
    number: "03",
    icon: Activity,
    title: "Track Activity",
    description:
      "Every action is logged in real time across all departments. Nothing slips through. Managers see what's moving, what's blocked, and what needs attention.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "View Results",
    description:
      "Executives see live outcomes — cash position, sales performance, workforce status, financial health — without waiting for a single manual report.",
    cta: { label: "Start Free", href: "/register" },
  },
] as const;

export function HowItWorksNewSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">
            Core philosophy
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            How the platform works
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Every action updates the system instantly — creating a live, accurate
            view of the business at all times.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">

          {/* Connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-10 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center relative">

                {/* Number + icon bubble */}
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <step.icon className="h-9 w-9 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center border-2 border-white">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {"cta" in step && step.cta && (
                  <Link
                    href={step.cta.href}
                    className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
                  >
                    {step.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Flow summary */}
        <div className="mt-14 flex flex-wrap justify-center items-center gap-2 text-sm font-semibold text-slate-500">
          {["Input Data", "Execute Work", "Track Activity", "View Results"].map((label, i, arr) => (
            <span key={label} className="flex items-center gap-2">
              <span className="text-slate-700">{label}</span>
              {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-blue-400" />}
            </span>
          ))}
          <span className="ml-2 text-blue-600 font-bold">(Real-Time)</span>
        </div>

      </div>
    </section>
  );
}
