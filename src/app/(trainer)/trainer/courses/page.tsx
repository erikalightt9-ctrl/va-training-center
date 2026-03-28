import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  BookOpen,
  FileText,
  CalendarClock,
  FolderOpen,
  Star,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { ModuleDashboard } from "@/components/shared/ModuleDashboard";
import type { DashboardCardProps } from "@/components/shared/DashboardCard";

export const metadata: Metadata = { title: "Courses | HUMI Trainer Portal" };

const COURSES_CARDS: ReadonlyArray<Omit<DashboardCardProps, "currentRole">> = [
  {
    href: "/trainer/courses/list",
    label: "My Courses",
    description: "View all courses you are assigned to train.",
    icon: BookOpen,
    colorClass: "bg-blue-100 text-blue-700",
  },
  {
    href: "/trainer/schedule",
    label: "My Schedule",
    description: "Your upcoming training sessions and batch calendar.",
    icon: CalendarClock,
    colorClass: "bg-orange-100 text-orange-700",
  },
  {
    href: "/trainer/materials",
    label: "Materials",
    description: "Access and manage training materials and resources.",
    icon: FolderOpen,
    colorClass: "bg-purple-100 text-purple-700",
  },
  {
    href: "/trainer/lessons",
    label: "Lessons",
    description: "Browse and manage lesson content for your courses.",
    icon: FileText,
    colorClass: "bg-teal-100 text-teal-700",
  },
  {
    href: "/trainer/ratings",
    label: "My Ratings",
    description: "View student ratings and feedback on your training.",
    icon: Star,
    colorClass: "bg-amber-100 text-amber-700",
  },
];

export default async function TrainerCoursesHubPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; role: string } | undefined;

  if (!user || user.role !== "trainer") {
    redirect("/trainer/login");
  }

  return (
    <ModuleDashboard
      title="Courses"
      description="Access your assigned courses, schedule, materials, and student ratings."
      icon={BookOpen}
      iconColorClass="bg-blue-100 text-blue-700"
      cards={COURSES_CARDS}
      currentRole="trainer"
    />
  );
}
