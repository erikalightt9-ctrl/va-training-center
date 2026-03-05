import { getQuizzesByCourse } from "@/lib/repositories/quiz.repository";
import Link from "next/link";

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
        <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        <p className="text-gray-500 text-sm mt-1">Test your knowledge</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No quizzes available yet.
        </div>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 text-lg">{quiz.title}</h2>
            {quiz.description && <p className="text-gray-500 text-sm mt-1">{quiz.description}</p>}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span>{quiz._count.questions} questions</span>
              <span>Pass: {quiz.passingScore}%</span>
            </div>
            <Link href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Take Quiz
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
