import type { Metadata } from "next";
import {
  Building2,
  DollarSign,
  TrendingUp,
  BookOpen,
  Headphones,
  Check,
} from "lucide-react";
import { EnterpriseInquiryForm } from "@/components/public/EnterpriseInquiryForm";

export const metadata: Metadata = {
  title: "Enterprise Training Solutions",
  description:
    "Custom VA and AI training programs for businesses. Train your team with AI-powered virtual assistant skills and boost productivity.",
};

const benefits = [
  {
    icon: DollarSign,
    title: "Reduce Costs",
    description:
      "Save up to 70% on administrative tasks by training your team with AI-powered VA skills.",
  },
  {
    icon: TrendingUp,
    title: "Increase Productivity",
    description:
      "3x productivity boost with AI tools integration and proven VA methodologies.",
  },
  {
    icon: BookOpen,
    title: "Custom Curriculum",
    description:
      "Tailored training programs designed around your industry and business needs.",
  },
  {
    icon: Headphones,
    title: "Ongoing Support",
    description:
      "Dedicated account manager, progress tracking, and post-training support.",
  },
] as const;

const packages = [
  {
    name: "Team Package",
    teamSize: "5-10 trainees",
    price: "P10,000",
    priceNote: "per person",
    popular: false,
    features: [
      "Core VA training modules",
      "AI tools workshop",
      "Team collaboration exercises",
      "Completion certificates",
    ],
    cta: "Get Started",
  },
  {
    name: "Department Package",
    teamSize: "11-25 trainees",
    price: "P8,000",
    priceNote: "per person",
    popular: true,
    features: [
      "Everything in Team",
      "Custom training modules",
      "Dedicated instructor",
      "Progress dashboard",
      "Priority support",
    ],
    cta: "Get Started",
  },
  {
    name: "Enterprise Package",
    teamSize: "25+ trainees",
    price: "Custom",
    priceNote: "pricing",
    popular: false,
    features: [
      "Everything in Department",
      "Fully custom curriculum",
      "Onsite or virtual delivery",
      "Executive reporting",
      "12-month support",
    ],
    cta: "Contact Us",
  },
] as const;

const clientNames = [
  "TechCorp",
  "GlobalHealth Inc.",
  "PropertyPro",
  "FinanceFirst",
  "MediaGroup",
] as const;

export default function EnterprisePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-blue-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-amber-300" />
          <h1 className="text-4xl font-extrabold mb-4">
            Enterprise Training Solutions
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Train your teams with AI-powered VA skills. Custom programs designed
            to reduce costs, increase productivity, and future-proof your
            workforce.
          </p>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Why Train Your Team?
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              The Benefits of VA + AI Training
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Equip your workforce with the skills to work smarter, not harder.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Packages */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Training Packages
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Choose the Right Plan for Your Team
            </h2>
            <p className="text-gray-600">
              Flexible packages designed for teams of every size.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative bg-white rounded-xl p-8 border shadow-sm flex flex-col ${
                  pkg.popular
                    ? "border-blue-600 ring-2 ring-blue-600"
                    : "border-gray-100"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{pkg.teamSize}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {pkg.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      /{pkg.priceNote}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href="#inquiry-form"
                  className={`inline-flex items-center justify-center rounded-md font-semibold px-6 py-3 transition-colors text-center ${
                    pkg.popular
                      ? "bg-blue-700 text-white hover:bg-blue-800"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {pkg.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">
              Trusted By Leading Companies
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {clientNames.map((name) => (
              <div
                key={name}
                className="text-xl font-bold text-gray-300 select-none"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Inquiry Form */}
      <section id="inquiry-form" className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Get in Touch
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
              Enterprise Inquiry
            </h2>
            <p className="text-gray-600">
              Tell us about your team and training needs. We will get back to you
              with a tailored proposal.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
            <EnterpriseInquiryForm />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            Transform Your Team Today
          </h2>
          <p className="text-blue-100 mb-8">
            Equip your workforce with AI-powered VA skills and see measurable
            results within weeks.
          </p>
          <a
            href="#inquiry-form"
            className="inline-flex items-center justify-center rounded-md bg-amber-300 text-gray-900 font-semibold px-8 py-3 hover:bg-amber-400 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
