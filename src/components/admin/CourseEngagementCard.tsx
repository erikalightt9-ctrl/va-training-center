import {
  Users,
  BookOpen,
  GraduationCap,
  FileCheck,
  Activity,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CourseEngagementMetrics } from "@/lib/types/engagement.types";

interface CourseEngagementCardProps {
  readonly metrics: CourseEngagementMetrics;
}

interface MetricItem {
  readonly label: string;
  readonly value: string;
  readonly icon: React.ElementType;
  readonly colorClass: string;
}

function buildMetricItems(
  metrics: CourseEngagementMetrics
): ReadonlyArray<MetricItem> {
  return [
    {
      label: "Enrolled",
      value: String(metrics.totalEnrolled),
      icon: Users,
      colorClass: "text-blue-600 bg-blue-100",
    },
    {
      label: "Lesson Completion",
      value: `${metrics.lessonCompletionRate}%`,
      icon: BookOpen,
      colorClass: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Avg Quiz Score",
      value: `${metrics.averageQuizScore}%`,
      icon: GraduationCap,
      colorClass: "text-purple-600 bg-purple-100",
    },
    {
      label: "Submission Rate",
      value: `${metrics.assignmentSubmissionRate}%`,
      icon: FileCheck,
      colorClass: "text-orange-600 bg-orange-100",
    },
    {
      label: "Active (7d)",
      value: String(metrics.activeStudents),
      icon: Activity,
      colorClass: "text-green-600 bg-green-100",
    },
    {
      label: "Forum Posts",
      value: String(metrics.forumPostCount),
      icon: MessageSquare,
      colorClass: "text-sky-600 bg-sky-100",
    },
  ];
}

export function CourseEngagementCard({ metrics }: CourseEngagementCardProps) {
  const items = buildMetricItems(metrics);

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {metrics.courseTitle}
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.colorClass}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
