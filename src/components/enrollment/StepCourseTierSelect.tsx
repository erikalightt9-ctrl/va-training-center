"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckCircle, Loader2, Star, Zap, Crown } from "lucide-react";
import type { EnrollmentFormData } from "@/lib/validations/enrollment.schema";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CourseTierValue = "BASIC" | "PROFESSIONAL" | "ADVANCED";

interface CoursePricing {
  readonly priceBasic: string | number;
  readonly priceProfessional: string | number;
  readonly priceAdvanced: string | number;
}

interface StepCourseTierSelectProps {
  readonly form: UseFormReturn<EnrollmentFormData>;
  readonly courseId: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIER_CONFIG: Readonly<
  Record<
    CourseTierValue,
    {
      readonly label: string;
      readonly description: string;
      readonly features: readonly string[];
      readonly bg: string;
      readonly border: string;
      readonly selectedBorder: string;
      readonly badge: string;
      readonly priceKey: keyof CoursePricing;
      readonly icon: typeof Star;
    }
  >
> = {
  BASIC: {
    label: "Basic",
    description: "Core concepts and beginner exercises",
    features: [
      "Introduction modules",
      "Core concept lessons",
      "Beginner exercises",
      "Simple quizzes",
      "Basic certificate",
    ],
    bg: "bg-white",
    border: "border-gray-200",
    selectedBorder: "border-gray-500 ring-2 ring-gray-200",
    badge: "bg-gray-100 text-gray-700",
    priceKey: "priceBasic",
    icon: Star,
  },
  PROFESSIONAL: {
    label: "Professional",
    description: "Case studies and hands-on exercises",
    features: [
      "Everything in Basic",
      "Case studies",
      "Hands-on exercises",
      "Applied quizzes",
      "Professional certificate",
      "Community access",
    ],
    bg: "bg-blue-50/30",
    border: "border-blue-200",
    selectedBorder: "border-blue-500 ring-2 ring-blue-200",
    badge: "bg-blue-100 text-blue-700",
    priceKey: "priceProfessional",
    icon: Zap,
  },
  ADVANCED: {
    label: "Advanced",
    description: "Industry tools and mastery assessments",
    features: [
      "Everything in Professional",
      "Industry tools training",
      "Real-world scenarios",
      "Mastery assessments",
      "Advanced certificate",
      "1-on-1 mentoring",
      "Job placement support",
    ],
    bg: "bg-purple-50/30",
    border: "border-purple-200",
    selectedBorder: "border-purple-500 ring-2 ring-purple-200",
    badge: "bg-purple-100 text-purple-700",
    priceKey: "priceAdvanced",
    icon: Crown,
  },
};

const TIER_ORDER: readonly CourseTierValue[] = ["BASIC", "PROFESSIONAL", "ADVANCED"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StepCourseTierSelect({ form, courseId }: StepCourseTierSelectProps) {
  const [pricing, setPricing] = useState<CoursePricing | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedTier = form.watch("courseTier") as CourseTierValue | undefined;

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    fetch(`/api/courses/${courseId}/pricing`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPricing(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  function selectTier(tier: CourseTierValue) {
    form.setValue("courseTier", tier, { shouldValidate: true });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Loading tier options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Select Your Training Tier</h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose the level that best fits your learning goals. You can always upgrade later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIER_ORDER.map((tierKey) => {
          const config = TIER_CONFIG[tierKey];
          const isSelected = selectedTier === tierKey;
          const Icon = config.icon;
          const tierPrice = pricing
            ? Number(pricing[config.priceKey])
            : 0;

          return (
            <button
              key={tierKey}
              type="button"
              onClick={() => selectTier(tierKey)}
              className={`relative text-left rounded-xl border-2 p-5 transition-all ${
                config.bg
              } ${
                isSelected ? config.selectedBorder : `${config.border} hover:shadow-md`
              }`}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}

              {/* Tier badge + icon */}
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-5 w-5 text-gray-600" />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                  {config.label}
                </span>
              </div>

              {/* Price */}
              <div className="mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  ₱{tierPrice.toLocaleString()}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{config.description}</p>

              {/* Features */}
              <ul className="space-y-1.5">
                {config.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Select button */}
              <div className={`mt-4 text-center py-2 rounded-lg text-sm font-medium transition ${
                isSelected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
                {isSelected ? "Selected" : "Select Plan"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
