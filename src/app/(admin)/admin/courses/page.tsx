import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { BookOpen, Users, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Courses | VA Admin" };

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          enrollments: true,
          lessons: true,
          quizzes: true,
          assignments: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage courses, lessons, quizzes, and assignments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {course.title}
            </h2>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {course.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-blue-500" />
                <span>{course._count.enrollments} enrolled</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4 text-green-500" />
                <span>{course._count.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                <span>{course._count.quizzes} quizzes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>{course._count.assignments} assignments</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700">
                {course.durationWeeks} weeks · ₱{Number(course.price).toLocaleString()}
              </span>
              <Link
                href={`/admin/lessons?courseId=${course.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Manage Lessons →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
