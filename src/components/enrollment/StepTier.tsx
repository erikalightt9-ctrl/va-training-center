"use client";

import { CheckCircle2 } from "lucide-react";
import type { TrainingTier } from "@prisma/client";

interface StepTierProps {
  selectedTierId: string;
  tiers: TrainingTier[];
  onSelect: (tierId: string) => void;
  error?: string;
}

export function StepTier({ selectedTierId, tiers, onSelect, error }: StepTierProps) {
  const formatPrice = (price: number | { toString(): string }) =>
    `₱${Number(price).toLocaleString("en-PH")}`;

  if (tiers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No training tiers available. Please contact the administrator.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Select Your Training Tier</h2>
      <p className="text-sm text-gray-500 mb-6">
        Choose the level that best fits your learning goals. You can always upgrade later.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((tier, index) => {
          const isSelected = selectedTierId === tier.id;
          const isPopular = index === 1;

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelect(tier.id)}
              className={`relative text-left rounded-2xl border-2 p-5 transition-all focus:outline-none ${
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <span className="absolute top-3 right-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </span>
              )}

              {/* Popular badge */}
              {isPopular && !isSelected && (
                <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Popular
                </span>
              )}

              {/* Tier name */}
              <p className="text-sm font-medium text-gray-500 mb-1">{tier.name}</p>

              {/* Price */}
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatPrice(tier.price)}</p>

              {/* Description */}
              {tier.description && (
                <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
              )}

              {/* Features */}
              {tier.features.length > 0 && (
                <ul className="space-y-1.5">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Selected indicator */}
              <div
                className={`mt-4 text-center text-sm font-medium py-1.5 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isSelected ? "Selected" : "Select Plan"}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
    </div>
  );
}
