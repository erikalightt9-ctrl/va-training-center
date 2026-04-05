import {
  GraduationCap,
  Briefcase,
  Megaphone,
  ShoppingBag,
  Wrench,
  Building2,
} from "lucide-react";

const industries = [
  { icon: GraduationCap, label: "Training Centers" },
  { icon: Building2,    label: "Corporate & SMEs" },
  { icon: Megaphone,    label: "Agencies" },
  { icon: Briefcase,    label: "Consultancies" },
  { icon: ShoppingBag, label: "Retail & Sales" },
  { icon: Wrench,       label: "Service Businesses" },
] as const;

const pillars = [
  { number: "01", label: "HR & Payroll" },
  { number: "02", label: "Finance & Accounting" },
  { number: "03", label: "IT & Automation" },
  { number: "04", label: "Sales Tracking" },
  { number: "05", label: "Admin Support" },
  { number: "06", label: "Learning Management" },
] as const;

export function NicheSection() {
  return (
    <section className="relative bg-blue-950 text-white overflow-hidden">
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        {/* ── Top label ── */}
        <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-4 text-center">
          Our Niche
        </p>

        {/* ── Headline ── */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center max-w-3xl mx-auto leading-tight">
          Built for Growing Businesses{" "}
          <span className="text-blue-400">Across Industries</span>
        </h2>

        {/* ── Body copy ── */}
        <div className="mt-8 max-w-2xl mx-auto space-y-4 text-center text-blue-100/80 text-base sm:text-lg leading-relaxed">
          <p>
            HUMI Hub is designed for small to medium-sized businesses across
            multiple industries that need a smarter, more efficient way to
            manage their operations. Whether you run a training center, agency,
            consultancy, or service-based company, we give you the tools to
            centralize and streamline every part of your business.
          </p>
          <p>
            From HR and administration to IT systems, sales tracking, and
            finance management, our all-in-one platform replaces multiple
            disconnected tools with a single integrated solution — so your team
            can operate faster, reduce overhead, and scale with confidence.
          </p>
        </div>

        {/* ── Industry pills ── */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {industries.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              <Icon className="h-4 w-4 text-blue-300" />
              {label}
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="mt-16 border-t border-white/10" />

        {/* ── Business pillars ── */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {pillars.map(({ number, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-blue-400 tracking-widest">
                {number}
              </span>
              <span className="text-sm font-semibold text-white leading-snug">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Tagline ── */}
        <p className="mt-14 text-center text-xl sm:text-2xl font-semibold text-white/90 italic">
          &ldquo;One platform to manage your entire business — simple,
          scalable, and built for growth.&rdquo;
        </p>

      </div>
    </section>
  );
}
