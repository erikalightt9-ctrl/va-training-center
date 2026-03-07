import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseDetailPage } from "@/components/public/CourseDetailPage";
import { getPreviewLessons } from "@/lib/repositories/lesson.repository";

export const metadata: Metadata = {
  title: "Medical Virtual Assistant Course",
  description:
    "Become a certified Medical VA. Learn medical terminology, EHR systems, HIPAA compliance, and clinical documentation.",
};

export default async function MedicalVAPage() {
  const course = await prisma.course.findUnique({ where: { slug: "MEDICAL_VA" } });
  if (!course) return notFound();
  const previewLessons = await getPreviewLessons(course.id);
  return <CourseDetailPage course={course} previewLessons={previewLessons} />;
}
