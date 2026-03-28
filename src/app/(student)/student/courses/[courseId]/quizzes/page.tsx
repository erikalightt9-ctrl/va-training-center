import { getQuizzesByCourse } from "@/lib/repositories/quiz.repository";
import Link from "next/link";
import { Clock, HelpCircle } from "lucide-react";
import { QuizLeaderboard } from "@/components/student/QuizLeaderboard";

export const dynamic = "force-dynamic";

export default async function QuizListPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const quizzes = await getQuizzesByCourse(courseId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ds-text">Quizzes</h1>
        <p className="text-ds-muted text-sm mt-0.5">Test your knowledge</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz list */}
        <div className="lg:col-span-2 space-y-3">
          {quizzes.length === 0 ? (
            <div className="bg-ds-card rounded-xl border border-ds-border p-10 text-center">
              <HelpCircle className="h-10 w-10 text-ds-muted/30 mx-auto mb-3" />
              <p className="text-ds-muted text-sm">No quizzes available yet.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-ds-card rounded-xl border border-ds-border p-5">
                <h2 className="font-semibold text-ds-text text-base">{quiz.title}</h2>
                {quiz.description && (
                  <p className="text-ds-muted text-sm mt-1">{quiz.description}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-sm text-ds-muted">
                  <span>{quiz._count.questions} questions</span>
                  <span>Pass: {quiz.passingScore}%</span>
                  {(quiz as { duration?: number | null }).duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {(quiz as { duration?: number | null }).duration} min
                    </span>
                  )}
                </div>
                <Link
                  href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                  className="mt-4 inline-block bg-ds-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Take Quiz
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Leaderboard sidebar */}
        <div className="lg:col-span-1">
          <QuizLeaderboard courseId={courseId} />
        </div>
      </div>
    </div>
  );
}
