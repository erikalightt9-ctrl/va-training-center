import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

interface PricingTier {
  readonly name: string;
  readonly description: string;
  readonly price: string;
  readonly period: string;
  readonly features: readonly string[];
  readonly highlighted: boolean;
  readonly cta: string;
  readonly href: string;
}

const tiers: readonly PricingTier[] = [
  {
    name: "Basic",
    description: "Perfect for small training centers just getting started.",
    price: "Free",
    period: "to get started",
    features: [
      "Up to 50 students",
      "3 active courses",
      "Basic analytics",
      "Email support",
      "Student portal",
      "Certificate generation",
    ],
    highlighted: false,
    cta: "Start Free",
    href: "/portal?tab=enroll",
  },
  {
    name: "Professional",
    description: "For growing organizations that need the full platform.",
    price: "Custom",
    period: "per month",
    features: [
      "Unlimited students",
      "Unlimited courses",
      "Full LMS + messaging",
      "AI automation & tickets",
      "Advanced analytics",
      "Trainer dashboard",
      "Payment management",
      "Priority support",
    ],
    highlighted: true,
    cta: "Contact Sales",
    href: "/contact",
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom requirements.",
    price: "Custom",
    period: "tailored pricing",
    features: [
      "Everything in Professional",
      "White-label branding",
      "Custom domain",
      "Multi-tenant management",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Data migration assistance",
    ],
    highlighted: false,
    cta: "Contact Sales",
    href: "/contact",
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Scalable Pricing
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 flex flex-col ${
                tier.highlighted
                  ? "bg-blue-900 text-white ring-2 ring-blue-600 shadow-xl scale-[1.02]"
                  : "bg-white border border-gray-200"
              }`}
            >
              {tier.highlighted && (
                <span className="inline-block text-xs font-semibold bg-amber-400 text-amber-900 px-3 py-1 rounded-full mb-4 self-start">
                  Most Popular
                </span>
              )}

              <h3 className={`text-xl font-bold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                {tier.name}
              </h3>
              <p className={`text-sm mt-1 mb-4 ${tier.highlighted ? "text-blue-200" : "text-gray-500"}`}>
                {tier.description}
              </p>

              <div className="mb-6">
                <span className={`text-3xl font-extrabold ${tier.highlighted ? "text-white" : "text-gray-900"}`}>
                  {tier.price}
                </span>
                <span className={`text-sm ml-1 ${tier.highlighted ? "text-blue-200" : "text-gray-500"}`}>
                  {tier.period}
                </span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${tier.highlighted ? "text-amber-300" : "text-blue-600"}`} />
                    <span className={`text-sm ${tier.highlighted ? "text-blue-100" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full ${
                  tier.highlighted
                    ? "bg-white text-blue-900 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Link href={tier.href}>
                  {tier.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
