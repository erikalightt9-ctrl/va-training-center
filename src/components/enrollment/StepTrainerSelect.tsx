"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Star, UserCog, Award, Users, Loader2, CheckCircle } from "lucide-react";
import type { EnrollmentFormData } from "@/lib/validations/enrollment.schema";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TierValue = "BASIC" | "PROFESSIONAL" | "PREMIUM";

interface PublicTrainer {
  readonly id: string;
  readonly name: string;
  readonly photoUrl: string | null;
  readonly bio: string | null;
  readonly tier: TierValue;
  readonly specializations: ReadonlyArray<string>;
  readonly credentials: string | null;
  readonly certifications: ReadonlyArray<string>;
  readonly yearsOfExperience: number;
  readonly averageRating: string | number | null;
  readonly totalRatings: number;
  readonly studentsTrainedCount: number;
}

interface StepTrainerSelectProps {
  readonly form: UseFormReturn<EnrollmentFormData>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIER_CONFIG: Readonly<
  Record<
    TierValue,
    {
      readonly label: string;
      readonly upgradeFee: number;
      readonly totalPrice: number;
      readonly bg: string;
      readonly text: string;
      readonly border: string;
      readonly ring: string;
      readonly description: string;
    }
  >
> = {
  BASIC: {
    label: "Basic",
    upgradeFee: 0,
    totalPrice: 1500,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    ring: "ring-gray-400",
    description: "Standard training program",
  },
  PROFESSIONAL: {
    label: "Professional",
    upgradeFee: 2000,
    totalPrice: 3500,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    ring: "ring-blue-500",
    description: "Enhanced training with experienced mentors",
  },
  PREMIUM: {
    label: "Premium",
    upgradeFee: 6000,
    totalPrice: 7500,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-500",
    description: "Elite training with top-rated professionals",
  },
};

/* ------------------------------------------------------------------ */
/*  TrainerCard                                                        */
/* ------------------------------------------------------------------ */

function TrainerCard({
  trainer,
  isSelected,
  onSelect,
}: {
  readonly trainer: PublicTrainer;
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  const config = TIER_CONFIG[trainer.tier];
  const numRating = trainer.averageRating ? Number(trainer.averageRating) : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
        isSelected
          ? `${config.border} ring-2 ${config.ring} shadow-md`
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Photo */}
        {trainer.photoUrl ? (
          <img
            src={trainer.photoUrl}
            alt={trainer.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border-2 border-gray-200">
            <UserCog className="h-6 w-6 text-blue-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {trainer.name}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.text}`}
            >
              {config.label}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
            {trainer.totalRatings > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {numRating.toFixed(1)} ({trainer.totalRatings})
              </span>
            )}
            {trainer.yearsOfExperience > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Award className="h-3 w-3" />
                {trainer.yearsOfExperience}yr exp.
              </span>
            )}
            {trainer.studentsTrainedCount > 0 && (
              <span className="inline-flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                {trainer.studentsTrainedCount} students
              </span>
            )}
          </div>

          {/* Bio */}
          {trainer.bio && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
              {trainer.bio}
            </p>
          )}

          {/* Specializations */}
          {trainer.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {trainer.specializations.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]"
                >
                  {spec}
                </span>
              ))}
              {trainer.specializations.length > 3 && (
                <span className="text-[10px] text-gray-400">
                  +{trainer.specializations.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-gray-900">
            ₱{config.totalPrice.toLocaleString()}
          </p>
          {config.upgradeFee > 0 && (
            <p className="text-[10px] text-gray-400">
              ₱1,500 + ₱{config.upgradeFee.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Default Option (Auto-assign)                                       */
/* ------------------------------------------------------------------ */

function AutoAssignCard({
  isSelected,
  onSelect,
}: {
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
        isSelected
          ? "border-green-300 ring-2 ring-green-400 shadow-md bg-green-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center shrink-0 border-2 border-green-200">
          <UserCog className="h-6 w-6 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">
            Auto-Assign Basic Trainer
          </p>
          <p className="text-xs text-gray-500">
            We&apos;ll assign an available trainer for you at the lowest rate
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-gray-900">₱1,500</p>
          <p className="text-[10px] text-gray-400">Base price</p>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function StepTrainerSelect({ form }: StepTrainerSelectProps) {
  const [trainers, setTrainers] = useState<ReadonlyArray<PublicTrainer>>([]);
  const [loading, setLoading] = useState(true);

  const selectedTrainerId = form.watch("trainerId");

  useEffect(() => {
    async function fetchTrainers() {
      try {
        const res = await fetch("/api/public/trainers");
        const json = await res.json();
        if (json.success) {
          setTrainers(json.data);
        }
      } catch {
        // Silently fail — auto-assign will be the default
      } finally {
        setLoading(false);
      }
    }
    fetchTrainers();
  }, []);

  function handleSelectTrainer(trainerId: string | null) {
    form.setValue("trainerId", trainerId ?? undefined, {
      shouldDirty: true,
    });
  }

  // Group trainers by tier
  const premiumTrainers = trainers.filter((t) => t.tier === "PREMIUM");
  const professionalTrainers = trainers.filter(
    (t) => t.tier === "PROFESSIONAL",
  );
  const basicTrainers = trainers.filter((t) => t.tier === "BASIC");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">
          Loading available trainers...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Choose Your Trainer
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a trainer based on your preferred level of mentorship and
          budget. All tiers include the full training program.
        </p>
      </div>

      {/* Pricing breakdown info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <strong>How pricing works:</strong> Base program fee is ₱1,500.
        Professional and Premium trainers have an additional upgrade fee based on
        their expertise and experience.
      </div>

      {/* Auto-assign option */}
      <AutoAssignCard
        isSelected={!selectedTrainerId}
        onSelect={() => handleSelectTrainer(null)}
      />

      {/* Premium trainers */}
      {premiumTrainers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Premium Trainers
          </h3>
          <div className="space-y-2">
            {premiumTrainers.map((t) => (
              <TrainerCard
                key={t.id}
                trainer={t}
                isSelected={selectedTrainerId === t.id}
                onSelect={() => handleSelectTrainer(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Professional trainers */}
      {professionalTrainers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-700 mb-2">
            Professional Trainers
          </h3>
          <div className="space-y-2">
            {professionalTrainers.map((t) => (
              <TrainerCard
                key={t.id}
                trainer={t}
                isSelected={selectedTrainerId === t.id}
                onSelect={() => handleSelectTrainer(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Basic trainers */}
      {basicTrainers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Basic Trainers
          </h3>
          <div className="space-y-2">
            {basicTrainers.map((t) => (
              <TrainerCard
                key={t.id}
                trainer={t}
                isSelected={selectedTrainerId === t.id}
                onSelect={() => handleSelectTrainer(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {trainers.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-500">
          No trainers are currently available. A trainer will be auto-assigned
          after enrollment.
        </div>
      )}
    </div>
  );
}
