import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseDetailPage } from "@/components/public/CourseDetailPage";
import { getPreviewLessons } from "@/lib/repositories/lesson.repository";

export const metadata: Metadata = {
  title: "US Bookkeeping Virtual Assistant Course",
  description:
    "Master US bookkeeping standards. Learn QuickBooks, bank reconciliation, payroll basics, and financial reporting.",
};

export default async function USBookkeepingVAPage() {
  const course = await prisma.course.findUnique({ where: { slug: "US_BOOKKEEPING_VA" } });
  if (!course) return notFound();
  const previewLessons = await getPreviewLessons(course.id);
  return <CourseDetailPage course={course} previewLessons={previewLessons} />;
}
