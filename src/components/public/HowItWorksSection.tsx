import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Layers,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const steps = [
  {
    icon: LayoutDashboard,
    step: "01",
    title: "Set Up Your Workspace",
    description:
      "Register your organization, choose your industry, and configure your business profile in minutes — no technical setup required.",
  },
  {
    icon: Layers,
    step: "02",
    title: "Enable Your Modules",
    description:
      "Activate only what your business needs — HR, Finance, Training, Sales, IT, or Admin. Add more modules as you grow.",
  },
  {
    icon: Users,
    step: "03",
    title: "Onboard Your Team",
    description:
      "Invite staff, assign roles and permissions, and give every department their own focused workspace on day one.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Operate & Scale",
    description:
      "Run daily operations from a single dashboard. Track performance, automate workflows, and expand to new teams or branches anytime.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  HowItWorksSection                                                  */
/* ------------------------------------------------------------------ */

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-blue-500 font-semibold text-sm uppercase tracking-widest mb-2">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Up and Running{" "}
            <span className="text-blue-500">in 4 Simple Steps</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            From setup to full operations — get your entire business running on
            one platform without the complexity of switching between tools.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <div key={item.title} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+32px)] w-[calc(100%-64px)] h-0.5 bg-blue-100" />
              )}

              <div className="text-center">
                {/* Step number + icon */}
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors">
                    <item.icon className="h-8 w-8 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-blue-700 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Button
            asChild
            size="lg"
            className="bg-blue-700 hover:bg-blue-800 font-bold text-base px-8 py-6"
          >
            <Link href="/start-trial">
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
