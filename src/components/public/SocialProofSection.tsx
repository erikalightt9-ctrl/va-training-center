"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Company name placeholders — replace with real logos when available */
/* ------------------------------------------------------------------ */

const COMPANIES = [
  { name: "Apex Training Co.",    industry: "Training"   },
  { name: "BluePeak Solutions",   industry: "Consulting" },
  { name: "Meridian Group",       industry: "Corporate"  },
  { name: "Crestline Academy",    industry: "Training"   },
  { name: "Fortis Enterprise",    industry: "SME"        },
  { name: "Lumina HR Services",   industry: "HR"         },
  { name: "Vantage Staffing",     industry: "Agency"     },
  { name: "Pinnacle Institute",   industry: "Training"   },
  { name: "Harbor & Co.",         industry: "Consulting" },
  { name: "SkyBridge Corp",       industry: "Corporate"  },
  { name: "Nexus Workforce",      industry: "HR"         },
  { name: "Clarity Learning Hub", industry: "Training"   },
] as const;

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee track                                                      */
/* ------------------------------------------------------------------ */

function MarqueeTrack({ reverse = false }: { reverse?: boolean }) {
  const items = [...COMPANIES, ...COMPANIES];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex gap-4 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {items.map((c, i) => (
          <div
            key={`${c.name}-${i}`}
            className="flex-shrink-0 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
            style={{ minWidth: 180 }}
          >
            <p className="text-sm font-bold text-slate-800 text-center leading-tight">{c.name}</p>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
              {c.industry}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SocialProofSection                                                 */
/* ------------------------------------------------------------------ */

export function SocialProofSection() {
  return (
    <section className="bg-gray-50 border-y border-gray-200 py-16 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-2">
          Trusted by teams across industries
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Companies that run smarter with HUMI Hub
        </h2>
      </div>

      {/* Marquee rows */}
      <div className="space-y-4 mb-14">
        <MarqueeTrack />
        <MarqueeTrack reverse />
      </div>

      {/* Stat counters */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8 divide-x divide-gray-100">
          <Counter value={500}   suffix="+"  label="Companies onboarded"  />
          <Counter value={12000} suffix="+"  label="Active learners"       />
          <Counter value={98}    suffix="%"  label="Customer satisfaction" />
          <Counter value={4}     suffix=" min" label="Average setup time" />
        </div>
      </div>

      {/* Tailwind animation keyframes injected via style tag */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 30s linear infinite;
        }
        .animate-marquee:hover,
        .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
