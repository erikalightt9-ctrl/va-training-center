"use client";

import {
  BookOpen,
  ClipboardList,
  FileCheck,
  Clock,
  Star,
  CheckCircle2,
  HelpCircle,
  FileText,
  Timer,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RecentActivityItem {
  readonly id: string;
  readonly type: "lesson" | "quiz" | "assignment" | "attendance" | "points";
  readonly title: string;
  readonly detail: string;
  readonly timestamp: string;
}

interface WeeklyLessonData {
  readonly weekLabel: string;
  readonly count: number;
}

interface QuizScoreData {
  readonly quizTitle: string;
  readonly score: number;
  readonly completedAt: string;
}

interface AnalyticsData {
  readonly totalLessonsCompleted: number;
  readonly totalLessons: number;
  readonly avgQuizScore: number;
  readonly totalQuizzes: number;
  readonly assignmentsCompleted: number;
  readonly totalAssignments: number;
  readonly totalStudyHours: number;
  readonly totalPoints: number;
  readonly recentActivity: ReadonlyArray<RecentActivityItem>;
  readonly weeklyLessons: ReadonlyArray<WeeklyLessonData>;
  readonly quizScores: ReadonlyArray<QuizScoreData>;
}

interface LearningAnalyticsProps {
  readonly data: AnalyticsData;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACTIVITY_ICONS: Record<string, typeof BookOpen> = {
  lesson: CheckCircle2,
  quiz: ClipboardList,
  assignment: FileText,
  attendance: Timer,
  points: Zap,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
}: {
  readonly title: string;
  readonly value: string;
  readonly subtitle: string;
  readonly icon: typeof BookOpen;
  readonly colorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <div className={`rounded-lg p-2 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LearningAnalytics({ data }: LearningAnalyticsProps) {
  const lessonPercent =
    data.totalLessons > 0
      ? Math.round((data.totalLessonsCompleted / data.totalLessons) * 100)
      : 0;

  const maxWeeklyCount = Math.max(...data.weeklyLessons.map((w) => w.count), 1);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Lessons Completed"
          value={`${data.totalLessonsCompleted}/${data.totalLessons}`}
          subtitle={`${lessonPercent}% complete`}
          icon={BookOpen}
          colorClass="text-blue-600 bg-blue-100"
        />
        <StatCard
          title="Avg Quiz Score"
          value={data.totalQuizzes > 0 ? `${data.avgQuizScore}%` : "--"}
          subtitle={`${data.totalQuizzes} quizzes taken`}
          icon={ClipboardList}
          colorClass="text-green-600 bg-green-100"
        />
        <StatCard
          title="Assignments Done"
          value={`${data.assignmentsCompleted}/${data.totalAssignments}`}
          subtitle="Submitted"
          icon={FileCheck}
          colorClass="text-purple-600 bg-purple-100"
        />
        <StatCard
          title="Study Hours"
          value={`${data.totalStudyHours}`}
          subtitle="Total logged hours"
          icon={Clock}
          colorClass="text-orange-600 bg-orange-100"
        />
        <StatCard
          title="Total Points"
          value={data.totalPoints.toLocaleString()}
          subtitle="Points earned"
          icon={Star}
          colorClass="text-yellow-600 bg-yellow-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Weekly Progress
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Lessons completed per week (last 8 weeks)
          </p>

          {data.weeklyLessons.every((w) => w.count === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <HelpCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">No lessons completed in the past 8 weeks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.weeklyLessons.map((week) => {
                const widthPercent =
                  maxWeeklyCount > 0
                    ? Math.round((week.count / maxWeeklyCount) * 100)
                    : 0;
                return (
                  <div key={week.weekLabel} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16 shrink-0 text-right">
                      {week.weekLabel}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                      {week.count > 0 && (
                        <div
                          className="bg-blue-500 h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{
                            width: `${Math.max(widthPercent, 8)}%`,
                          }}
                        >
                          <span className="text-[10px] text-white font-medium">
                            {week.count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quiz Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Quiz Performance
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Scores from your last 10 quizzes
          </p>

          {data.quizScores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <HelpCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">No quizzes taken yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.quizScores.map((quiz, idx) => (
                <div key={`${quiz.quizTitle}-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 truncate max-w-[200px]">
                      {quiz.quizTitle}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        quiz.score >= 80
                          ? "text-green-600"
                          : quiz.score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {quiz.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`${getScoreColor(quiz.score)} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${quiz.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>

        {data.recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <HelpCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">
              No activity yet. Start your first lesson to get going!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentActivity.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] ?? BookOpen;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
