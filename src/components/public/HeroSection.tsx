import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  DollarSign,
  TrendingUp,
  Zap,
  CheckCircle2,
  Users,
} from "lucide-react";

const outcomes = [
  {
    icon: DollarSign,
    value: "$800\u2013$1,500/mo",
    label: "Average graduate salary",
  },
  {
    icon: TrendingUp,
    value: "85% Placed",
    label: "Within 30 days",
  },
  {
    icon: Zap,
    value: "3x Productivity",
    label: "With AI tools",
  },
] as const;

const proofPoints = [
  "AI tools training included",
  "Flexible schedule",
  "Payment plans available",
] as const;

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 lg:py-28 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column — Copy + CTAs */}
        <div className="animate-fade-in-down">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-100 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-white/20">
            <Users className="h-3.5 w-3.5 text-amber-300" />
            Trusted by 2,400+ Filipino VA Professionals
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Become an{" "}
            <span className="text-amber-300">AI-Powered</span>{" "}
            Virtual Assistant
          </h1>

          {/* Subheadline — outcome-focused */}
          <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
            Master human expertise + AI tools. Our graduates are{" "}
            <strong className="text-white">3x more productive</strong> and earn{" "}
            <strong className="text-white">$800&ndash;$1,500/month</strong>{" "}
            working remotely for US, UK &amp; AU clients.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-base px-8 py-6 shadow-lg shadow-blue-900/30"
            >
              <Link href="/enroll">
                Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 font-semibold text-base px-8 py-6"
            >
              <Link href="/programs">Explore Programs</Link>
            </Button>
          </div>

          {/* Social proof points */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {proofPoints.map((point) => (
              <span
                key={point}
                className="flex items-center gap-1.5 text-blue-200 text-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column — Outcome Cards */}
        <div className="flex flex-col gap-4">
          {/* Outcome cards — 3-col on mobile, stacked on desktop */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4">
            {outcomes.map((item) => (
              <div
                key={item.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="hidden lg:flex w-12 h-12 rounded-lg bg-amber-300/20 items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xl lg:text-3xl font-extrabold text-amber-300 leading-tight">
                      {item.value}
                    </p>
                    <p className="text-blue-200 text-xs lg:text-sm mt-0.5">
                      {item.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enrollment counter */}
          <p className="text-blue-300/70 text-xs lg:text-sm text-center lg:text-left mt-2">
            Join <strong className="text-blue-200">47+ students</strong> who
            enrolled this month
          </p>
        </div>
      </div>
    </section>
  );
}
