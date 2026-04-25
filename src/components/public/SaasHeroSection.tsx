import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarCheck,
  Users,
  BookOpen,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "500+",  label: "Companies onboarded" },
  { value: "12K+",  label: "Active learners"      },
  { value: "98%",   label: "Customer satisfaction" },
  { value: "4 min", label: "Average setup time"   },
] as const;

/* ------------------------------------------------------------------ */
/*  Trust signals                                                      */
/* ------------------------------------------------------------------ */

const trust = [
  { icon: Shield, label: "Enterprise-grade security" },
  { icon: Zap,    label: "No credit card required"   },
] as const;

/* ------------------------------------------------------------------ */
/*  Dashboard preview — CSS mock                                       */
/* ------------------------------------------------------------------ */

function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-14 max-w-3xl">
      {/* Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-2xl blur-xl" />

      {/* Window chrome */}
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-950/60">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-4 text-xs text-slate-400 font-mono">HUMI Hub — Admin Portal</span>
        </div>

        {/* Mock dashboard body */}
        <div className="p-5 grid grid-cols-3 gap-3">
          {/* Stat cards */}
          {[
            { label: "Active Employees", value: "142", color: "text-blue-400" },
            { label: "Courses Running",  value: "23",  color: "text-emerald-400" },
            { label: "Pending Approvals", value: "7",  color: "text-amber-400" },
          ].map((c) => (
            <div key={c.label} className="bg-slate-800/70 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-1 rounded-full bg-current ${c.color} opacity-60`} style={{ width: "65%" }} />
              </div>
            </div>
          ))}

          {/* Activity feed */}
          <div className="col-span-2 bg-slate-800/70 rounded-xl p-4 border border-white/5">
            <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live Activity
            </p>
            <div className="space-y-2">
              {[
                { label: "Maria S. completed Module 3",   time: "2m ago",  dot: "bg-green-400" },
                { label: "Leave request approved — Juan", time: "8m ago",  dot: "bg-blue-400"  },
                { label: "Payroll run processed",         time: "15m ago", dot: "bg-amber-400" },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.dot}`} />
                  <p className="text-xs text-slate-300 flex-1 truncate">{a.label}</p>
                  <span className="text-[10px] text-slate-500 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module pills */}
          <div className="bg-slate-800/70 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-300 mb-2">Modules</p>
            <div className="space-y-1.5">
              {[
                { label: "Training", color: "bg-blue-500/20 text-blue-300" },
                { label: "HR Ops",   color: "bg-emerald-500/20 text-emerald-300" },
                { label: "Analytics", color: "bg-violet-500/20 text-violet-300" },
              ].map((m) => (
                <span key={m.label} className={`block text-[11px] font-medium px-2 py-1 rounded-lg ${m.color}`}>
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SaasHeroSection                                                    */
/* ------------------------------------------------------------------ */

export function SaasHeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 pb-10 text-center">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-white/15">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Training + HR Operations, Unified
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
          Train your people.{" "}
          <br className="hidden sm:block" />
          Run your company.{" "}
          <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            One platform.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-blue-100/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          HUMI Hub combines structured learning, HR management, and company
          operations into a single control center — so your people grow and
          your business runs without the chaos.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-base px-8 h-13 shadow-lg w-full sm:w-auto"
          >
            <Link href="/contact">
              <CalendarCheck className="mr-2 h-4 w-4" />
              Book a Demo
            </Link>
          </Button>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-3.5 rounded-lg transition-colors w-full sm:w-auto"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-blue-300/70 text-sm mb-14">
          {trust.map((t) => (
            <span key={t.label} className="flex items-center gap-1.5">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            No setup fees
          </span>
        </div>

        {/* Dashboard preview */}
        <DashboardPreview />
      </div>

      {/* Stats bar */}
      <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mb-0.5">{s.value}</p>
                <p className="text-sm text-blue-300/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
