import type { CourseTier } from "@prisma/client";

/** Human-readable course tier labels */
export const COURSE_TIER_LABELS: Readonly<Record<CourseTier, string>> = {
  BASIC: "Basic",
  PROFESSIONAL: "Professional",
  ADVANCED: "Advanced",
} as const;

/** Short description of what each tier covers */
export const COURSE_TIER_DESCRIPTIONS: Readonly<Record<CourseTier, string>> = {
  BASIC: "Introduction, Core Concepts, Beginner Exercises, Simple Quiz",
  PROFESSIONAL: "Intermediate Topics, Case Studies, Hands-on Exercises, Applied Quiz",
  ADVANCED: "Advanced Techniques, Industry Tools, Real-world Scenarios, Mastery Assessment",
} as const;

/** UI colors for tier badges */
export const COURSE_TIER_COLORS: Readonly<
  Record<CourseTier, { readonly bg: string; readonly text: string; readonly border: string }>
> = {
  BASIC: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  PROFESSIONAL: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  ADVANCED: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
} as const;

/** Feature lists shown in tier comparison cards */
export const COURSE_TIER_FEATURES: Readonly<Record<CourseTier, readonly string[]>> = {
  BASIC: [
    "Introduction modules",
    "Core concept lessons",
    "Beginner exercises",
    "Simple quizzes",
    "Basic certificate",
  ],
  PROFESSIONAL: [
    "Everything in Basic",
    "Case studies",
    "Hands-on exercises",
    "Applied quizzes",
    "Professional certificate",
    "Community access",
  ],
  ADVANCED: [
    "Everything in Professional",
    "Industry tools training",
    "Real-world scenarios",
    "Mastery assessments",
    "Advanced certificate",
    "1-on-1 mentoring",
    "Job placement support",
  ],
} as const;

/** Ordered list of tiers for UI rendering */
export const COURSE_TIERS_ORDERED: readonly CourseTier[] = [
  "BASIC",
  "PROFESSIONAL",
  "ADVANCED",
] as const;

/** Module structure each tier should follow (used by AI generation) */
export const COURSE_TIER_MODULES: Readonly<Record<CourseTier, readonly string[]>> = {
  BASIC: [
    "Introduction",
    "Core Concepts",
    "Beginner Exercises",
    "Simple Quiz",
  ],
  PROFESSIONAL: [
    "Intermediate Topics",
    "Case Studies",
    "Hands-on Exercises",
    "Applied Quiz",
  ],
  ADVANCED: [
    "Advanced Techniques",
    "Industry Tools",
    "Real-world Scenarios",
    "Mastery Assessment",
  ],
} as const;
