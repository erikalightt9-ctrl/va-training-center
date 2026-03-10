import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Users, BookOpen, ClipboardCheck } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { getTrainerStudents } from "@/lib/repositories/trainer.repository";

export const metadata: Metadata = { title: "My Students | HUMI+ Trainer Portal" };
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TrainerStudentsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | (typeof session & { user: { id: string; role: string } })["user"]
    | undefined;

  if (!user || user.role !== "trainer") {
    redirect("/trainer/login");
  }

  const students = await getTrainerStudents(user.id);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-500 text-sm mt-1">
          Students assigned to your training batches.
        </p>
      </div>

      {students.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">
                    Course
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      Lessons Completed
                    </span>
                  </th>
                  <th className="text-center px-5 py-3 font-medium text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      Assignments Submitted
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {student.enrollment?.fullName ?? student.name}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {student.enrollment?.email ?? student.email}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {student.enrollment?.course?.title ?? "N/A"}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-700">
                      {student._count.completions}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-700">
                      {student._count.submissions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            {students.length} student{students.length !== 1 ? "s" : ""} total
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No Students Yet
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            You do not have any students assigned to you yet. Students will
            appear here once they are enrolled in your training batches.
          </p>
        </div>
      )}
    </>
  );
}
