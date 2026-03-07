"use client";

import {
  MessageSquare,
  Wrench,
  Bot,
  BookOpen,
  Briefcase,
  Zap,
  Loader2,
} from "lucide-react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

interface SkillScore {
  readonly name: string;
  readonly score: number;
  readonly level: SkillLevel;
}

interface StudentSkillData {
  readonly overallScore: number;
  readonly skills: ReadonlyArray<SkillScore>;
}

interface SkillTreeVisualizationProps {
  readonly initialData: StudentSkillData | null;
}

/* ------------------------------------------------------------------ */
/*  Level styling                                                      */
/* ------------------------------------------------------------------ */

const LEVEL_BADGE_STYLES: Record<SkillLevel, string> = {
  Beginner: "bg-gray-100 text-gray-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
  Expert: "bg-amber-100 text-amber-700",
};

const LEVEL_BAR_COLORS: Record<SkillLevel, string> = {
  Beginner: "bg-gray-400",
  Intermediate: "bg-blue-500",
  Advanced: "bg-purple-500",
  Expert: "bg-amber-500",
};

/* ------------------------------------------------------------------ */
/*  Skill icons                                                        */
/* ------------------------------------------------------------------ */

const SKILL_ICONS: Record<string, ReactNode> = {
  Communication: <MessageSquare className="h-5 w-5" />,
  "Technical Skills": <Wrench className="h-5 w-5" />,
  "AI Tools": <Bot className="h-5 w-5" />,
  "Industry Knowledge": <BookOpen className="h-5 w-5" />,
  Professionalism: <Briefcase className="h-5 w-5" />,
  Speed: <Zap className="h-5 w-5" />,
};

const SKILL_ICON_BG: Record<string, string> = {
  Communication: "bg-blue-100 text-blue-600",
  "Technical Skills": "bg-green-100 text-green-600",
  "AI Tools": "bg-violet-100 text-violet-600",
  "Industry Knowledge": "bg-orange-100 text-orange-600",
  Professionalism: "bg-rose-100 text-rose-600",
  Speed: "bg-cyan-100 text-cyan-600",
};

/* ------------------------------------------------------------------ */
/*  Overall Score Color                                                */
/* ------------------------------------------------------------------ */

function overallScoreColor(score: number): string {
  if (score >= 76) return "text-amber-600";
  if (score >= 51) return "text-purple-600";
  if (score >= 26) return "text-blue-600";
  return "text-gray-600";
}

function overallScoreBg(score: number): string {
  if (score >= 76) return "bg-amber-50 border-amber-200";
  if (score >= 51) return "bg-purple-50 border-purple-200";
  if (score >= 26) return "bg-blue-50 border-blue-200";
  return "bg-gray-50 border-gray-200";
}

function overallScoreLabel(score: number): string {
  if (score >= 76) return "Expert";
  if (score >= 51) return "Advanced";
  if (score >= 26) return "Intermediate";
  return "Beginner";
}

/* ------------------------------------------------------------------ */
/*  Skill Card                                                         */
/* ------------------------------------------------------------------ */

function SkillCard({ skill }: { readonly skill: SkillScore }) {
  const icon = SKILL_ICONS[skill.name] ?? <Wrench className="h-5 w-5" />;
  const iconBg = SKILL_ICON_BG[skill.name] ?? "bg-gray-100 text-gray-600";
  const badgeStyle = LEVEL_BADGE_STYLES[skill.level];
  const barColor = LEVEL_BAR_COLORS[skill.level];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
          <h3 className="font-semibold text-gray-900 text-sm">{skill.name}</h3>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeStyle}`}
        >
          {skill.level}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-end gap-1 mb-3">
        <span className="text-3xl font-bold text-gray-900">{skill.score}</span>
        <span className="text-sm text-gray-400 mb-1">/ 100</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${skill.score}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
      <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Wrench className="h-8 w-8 text-purple-600" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        No Skill Data Available
      </h2>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Complete lessons, quizzes, and simulations to build your skill profile.
        Your scores will appear here as you progress through your training.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SkillTreeVisualization({
  initialData,
}: SkillTreeVisualizationProps) {
  if (!initialData) {
    return <EmptyState />;
  }

  const { overallScore, skills } = initialData;

  // Check if all scores are zero (no real data yet)
  const hasAnyScore = skills.some((s) => s.score > 0);

  if (!hasAnyScore) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div
        className={`rounded-xl border p-6 text-center ${overallScoreBg(overallScore)}`}
      >
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Overall Skill Score
        </p>
        <p
          className={`text-6xl font-bold mt-2 ${overallScoreColor(overallScore)}`}
        >
          {overallScore}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {overallScoreLabel(overallScore)} Level
        </p>
      </div>

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  );
}
