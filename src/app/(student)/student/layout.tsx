import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentLayout } from "@/components/student/StudentLayout";

export default async function StudentPagesLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const user = session?.user as
    | (typeof session & { user: { id: string; role: string } })["user"]
    | undefined;

  if (!user || user.role !== "student") {
    redirect("/student/login");
  }

  const student = await prisma.student.findUnique({
    where: { id: user.id },
    select: {
      enrollment: {
        select: { courseId: true },
      },
    },
  });

  if (!student) {
    redirect("/student/login");
  }

  return (
    <StudentLayout courseId={student.enrollment.courseId}>
      {children}
    </StudentLayout>
  );
}
